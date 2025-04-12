declare global {
  interface Window {
    paypal: any;
  }
}
export { };

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { FooterComponent } from "../footer/footer.component";
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-booknow',
  standalone: true,
  templateUrl: './booknow.component.html',
  styleUrls: ['./booknow.component.css'],
  imports: [HeadercheckComponent, FooterComponent, CommonModule]
})


export class BooknowComponent implements OnInit, OnDestroy, AfterViewInit {
  doctorId: string | null = null;
  doctorProfile: any = null;
  availableDays: string[] = [];
  filteredDays: any[] = [];
  timeRange: string = '';
  btotalFee: number = 0;
  totalFee: number = 0;
  serviceCharge: number = 0.1;
  selectedDay: string = '';
  selectedClinicId: string = '';
  selectedMeetingLink: string = '';
  paypalRendered: boolean = false;

  @ViewChild('paypalContainer', { static: false }) paypalContainerRef!: ElementRef;
  patientId: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.authService.checkSession().subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/login']);
      } else {
        // Get Doctor ID from route parameters if available
        this.doctorId = this.route.snapshot.queryParamMap.get('Did');
        if (this.doctorId) {
          this.getDoctorProfileById(this.doctorId);
        }

        // Fetch patient profile if logged in
        this.dataService.getPatientProfile().subscribe({
          next: (res) => {
            const patientId = res.Pid ?? null;  // Set patient ID from response
            console.log('Patient ID:', patientId);
            this.patientId = patientId;

            // Prepare the payload for the booking
            const payload = {
              doctorId: this.doctorId ?? null,
              patientId: this.patientId,
            };
            console.log('Payload:', payload);
          },
          error: (err) => {
            console.error('Error fetching patient profile:', err);
          }
        });

        // Load PayPal script if running in the browser
        if (isPlatformBrowser(this.platformId)) {
          this.loadPayPalScript();
        }
      }
    });
  }


  ngAfterViewInit(): void {
    this.tryRenderPayPal();
  }

  ngOnDestroy(): void { }

  getDoctorProfileById(doctorId: string) {
    this.dataService.getDoctorByID(doctorId).subscribe((data: any) => {
      this.doctorProfile = data;
      this.generateAvailableDaysAndTimeRange(data?.Availability || '');
      this.calculateTotalFee();
      this.filterDaysForCurrentWeek();
    });
  }

  generateAvailableDaysAndTimeRange(availability: string) {
    const [daysPart, timePart] = availability.split(' ');
    if (daysPart.includes('-')) {
      const [startDay, endDay] = daysPart.split('-');
      const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const startIndex = allDays.indexOf(startDay);
      const endIndex = allDays.indexOf(endDay);

      // Ensure valid range
      if (startIndex >= 0 && endIndex >= 0 && startIndex <= endIndex) {
        this.availableDays = allDays.slice(startIndex, endIndex + 1);
      } else {
        console.warn('Invalid day range:', daysPart);
        this.availableDays = [];
      }
    } else {
      this.availableDays = [daysPart];
    }

    this.timeRange = timePart || '';
  }


  isNextWeek: boolean = false;// to track if the filtered days are from the next week


  // ✅ NEW METHOD — getDateForDay
  getDateForDay(day: string, referenceDate: Date = new Date()): Date {
    const daysOfWeek: { [key: string]: number } = {
      sun: 0,
      sunday: 0,
      mon: 1,
      monday: 1,
      tue: 2,
      tuesday: 2,
      wed: 3,
      wednesday: 3,
      thu: 4,
      thursday: 4,
      fri: 5,
      friday: 5,
      sat: 6,
      saturday: 6,
    };

    // Normalize input to lowercase for consistency
    const normalizedDay = day.toLowerCase().trim();

    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0); // Normalize

    const targetDayIndex = daysOfWeek[normalizedDay];

    if (targetDayIndex === undefined) {
      console.error(`Invalid day: ${day}`);
      return new Date(NaN); // Return invalid date for an invalid day
    }

    const todayDayIndex = today.getDay();
    const dayOffset = (targetDayIndex - todayDayIndex + 7) % 7;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0); // Reset time

    // Check if the target date is valid
    if (isNaN(targetDate.getTime())) {
      console.error(`Invalid date calculated for day: ${day}`);
      return new Date(NaN); // Return invalid date
    }

    // Debug: Log details
    console.log(
      `Day: ${day}, Normalized: ${normalizedDay}, TargetDayIndex: ${targetDayIndex}, TargetDate: ${targetDate.toISOString()}`
    );

    return targetDate;
  }

  // ✅ NEW METHOD — filterDaysForCurrentWeek
  filterDaysForCurrentWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize the current date

    // Get the start and end of the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999); // End of the day

    // Map available days to actual date objects
    this.filteredDays = this.availableDays.map((day) => {
      const dayDate = this.getDateForDay(day, today); // Get date for the day

      // Check for valid date before processing
      if (isNaN(dayDate.getTime())) {
        console.error(`Invalid date for day: ${day}`);
        return null; // Return null if invalid date
      }

      return {
        day,
        date: dayDate,
        fullDate: formatDate(dayDate, 'fullDate', 'en-US'),
        formattedDate: formatDate(dayDate, 'yyyy-MM-dd', 'en-US'),
      };
    }).filter((item) => item !== null); // Filter out any null values

    // Filter days that fall within the current week
    this.filteredDays = this.filteredDays.filter((item) => {
      return item.date >= startOfWeek && item.date <= endOfWeek;
    });

    // If no days for this week, use next week
    if (this.filteredDays.length === 0) {
      const nextWeekStart = new Date(startOfWeek);
      nextWeekStart.setDate(startOfWeek.getDate() + 7); // Start from next week

      this.filteredDays = this.availableDays.map((day) => {
        const dayDate = this.getDateForDay(day, nextWeekStart); // Get next week's date

        // Check for valid date before processing
        if (isNaN(dayDate.getTime())) {
          console.error(`Invalid date for day: ${day}`);
          return null; // Return null if invalid date
        }

        return {
          day,
          date: dayDate,
          fullDate: formatDate(dayDate, 'fullDate', 'en-US'),
          formattedDate: formatDate(dayDate, 'yyyy-MM-dd', 'en-US'),
        };
      }).filter((item) => item !== null); // Filter out any null values

      this.isNextWeek = true;
    } else {
      this.isNextWeek = false;
    }

    // Debugging: Log filtered days to see if they match the expected ones
    console.log('Filtered Days:', this.filteredDays);
  }





  // Add next available day after current week
  addNextAvailableDay() {
    const today = new Date();
    const nextDay = this.availableDays.map(day => {
      const dayDate = this.getDateForDay(day);
      return {
        day,
        date: dayDate,
        fullDate: formatDate(dayDate, 'fullDate', 'en-US'),
        formattedDate: formatDate(dayDate, 'yyyy-MM-dd', 'en-US')
      };
    }).find(item => item.date > today);

    if (nextDay) {
      this.filteredDays = [nextDay];
    }
  }

  // ✅ NEW METHOD — formats selected day into `YYYY-MM-DD`
  getFormattedDateForDay(day: string): string {
    const dateObj = this.getDateForDay(day);

    // Ensure that dateObj is valid
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.warn('Invalid day:', day);
      return ''; // Return empty string if invalid
    }

    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Ensure month is two digits
    const date = dateObj.getDate().toString().padStart(2, '0'); // Ensure date is two digits
    return `${year}-${month}-${date}`; // → "2025-04-12"
  }
  patientProfile: any;


  onDaySelected(event: Event) {
    const selectedDate = (event.target as HTMLSelectElement).value;
    this.selectedDay = selectedDate;

    // Get doctor and patient IDs
    const doctorId = this.doctorId ?? null;
    const patientId = this.patientId ?? null;

    // Optional: Validate IDs
    if (!doctorId || !patientId) {
      console.error('Missing required IDs', { doctorId, patientId });
      return; // Handle the error
    }

    // Check if any value is missing
    if (!doctorId || !patientId || !selectedDate) {
      console.error('Missing data to generate room name:', {
        doctorId,
        patientId,
        selectedDate
      });
      return; // Stop here if any value is missing
    }

    // Generate room name safely
    const roomName = `carepath-${doctorId}-${patientId}-${selectedDate}`.replace(/[^a-zA-Z0-9\-]/g, '');

    // Set the meeting link
    this.meetingLink = `https://meet.jit.si/${roomName}`;
    this.selectedMeetingLink = this.meetingLink; // Add this line

    this.tryRenderPayPal();
  }


  onClinicSelected(event: any) {
    this.selectedClinicId = event.target.value;
    this.tryRenderPayPal();
  }


  calculateTotalFee() {
    const consultationFee = parseFloat(this.doctorProfile?.ConsultationFee || '0');
    const clinicFee = this.doctorProfile?.ConsultationType?.toLowerCase() === 'online'
      ? 0
      : parseFloat(this.doctorProfile?.ClinicFee || '0');
    const serviceCharge = 250;
    this.btotalFee = consultationFee + clinicFee;
    this.totalFee = consultationFee + clinicFee + serviceCharge;
  }


  isFormValid(): boolean {
    const isOnline = this.doctorProfile?.ConsultationType?.toLowerCase() === 'online';
    return (
      this.selectedDay &&
      this.doctorProfile?.ConsultationFee &&
      this.doctorProfile?.ClinicFee &&
      (!isOnline || this.selectedMeetingLink) &&
      (isOnline || this.selectedClinicId) &&
      this.totalFee > 0
    );
  }

  loadPayPalScript() {
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=ASI9jMlbfXIjgtpdE8d3UEyFGsD6Yfs1tW8zE9B9IxIqYPkWgHIs24x4NYFUPXyEppGJJoG8gsuvnZ--&currency=USD';
    script.async = true;
    script.onload = () => this.tryRenderPayPal();
    document.body.appendChild(script);
  }

  tryRenderPayPal() {
    setTimeout(() => {
      if (
        isPlatformBrowser(this.platformId) &&
        window.paypal &&
        this.isFormValid() &&
        this.paypalContainerRef?.nativeElement &&
        !this.paypalRendered
      ) {
        this.paypalContainerRef.nativeElement.innerHTML = '';
        this.initializePayPalButton();
        this.paypalRendered = true;
      }
    }, 100);
  }

  initializePayPalButton() {
    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: this.totalFee.toFixed(2),
              currency_code: 'USD'
            }
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        const details = await actions.order.capture();
        alert('Payment Successful! Booking will now be saved.');

        const isOnline = this.doctorProfile?.ConsultationType?.toLowerCase() === 'online';

        const bookingData = {
          Did: this.doctorId,
          Date: this.selectedDay,
          Time: this.timeRange,
          Type: this.doctorProfile?.ConsultationType,
          Link: isOnline ? this.selectedMeetingLink : null,
          Cid: !isOnline ? this.selectedClinicId : null,
        };

        this.bookAppointment(bookingData);
        console.log('bookingData:', bookingData);
        this.saveBookingAndInvoice();
        return details;
      },
      onError: (err: any) => {
        console.error('PayPal payment error:', err);
        alert('Payment failed.');
      }
    }).render(this.paypalContainerRef.nativeElement);
  }



  bookAppointment(appointmentData: any) {
    this.dataService.bookAppointment(appointmentData).subscribe(
      () => alert('Booking saved successfully!'),
      (error) => {
        console.error('Error saving booking:', error);
        alert('Booking failed to save.');
      }
    );
  }


  saveBookingAndInvoice(): void {
    const invoiceData = {
      Did: this.doctorId, // Note: Backend doesn't use this, but included in case needed elsewhere
      Pid: this.patientId,
      IssuedDate: this.selectedDay,
      PaymentStatus: 'Paid',
      PaymentMethod: 'PayPal',
      TotalAmount: this.btotalFee, // Changed from TotalFee to TotalAmount
      FinalAmount: this.totalFee,
      Discount: 0.0, // Optional: Include if applicable, defaults to 0.0 in backend
    };
  
    this.dataService.addInvoice(invoiceData).subscribe({
      next: (res) => {
        console.log('Invoice saved successfully:', res);
        alert('Booking successful!');
        this.router.navigate(['/receipt'], { queryParams: { invoiceId: res.invoiceId } });
      },
      error: (err) => {
        console.error('Error saving invoice:', err);
        alert('Payment succeeded, but failed to save invoice. Please contact support.');
      },
    });
  }


  meetingLink: string = '';




}
