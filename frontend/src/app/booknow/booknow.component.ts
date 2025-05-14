// Declare global PayPal object
declare global {
  interface Window {
    paypal: any;
  }
}
export { };

// Angular and app-specific imports
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

  // Basic data variables
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

  // Lifecycle method - on init
  ngOnInit(): void {
    this.authService.checkSession().subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/login']);
      } else {
        this.doctorId = this.route.snapshot.queryParamMap.get('Did');
        if (this.doctorId) this.getDoctorProfileById(this.doctorId);

        // Fetch current patient profile
        this.dataService.getPatientProfile().subscribe({
          next: (res) => {
            this.patientId = res.Pid ?? null;
            console.log('Patient ID:', this.patientId);
          },
          error: (err) => console.error('Error fetching patient profile:', err)
        });

        // Load PayPal only on browser
        if (isPlatformBrowser(this.platformId)) this.loadPayPalScript();
      }
    });
  }

  ngAfterViewInit(): void {
    this.tryRenderPayPal(); // Attempt to render PayPal after view init
  }

  ngOnDestroy(): void { }

  // Fetches doctor profile and initializes day/time and fee data
  getDoctorProfileById(doctorId: string) {
    this.dataService.getDoctorByID(doctorId).subscribe((data: any) => {
      this.doctorProfile = data;
      this.generateAvailableDaysAndTimeRange(data?.Availability || '');
      this.calculateTotalFee();
      this.filterDaysForCurrentWeek();
    });
  }

  // Extracts available days and time range from availability string
  generateAvailableDaysAndTimeRange(availability: string) {
    const [daysPart, timePart] = availability.split(' ');
    if (daysPart.includes('-')) {
      const [startDay, endDay] = daysPart.split('-');
      const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const startIndex = allDays.indexOf(startDay);
      const endIndex = allDays.indexOf(endDay);
      this.availableDays = (startIndex >= 0 && endIndex >= 0 && startIndex <= endIndex)
        ? allDays.slice(startIndex, endIndex + 1)
        : [];
    } else {
      this.availableDays = [daysPart];
    }
    this.timeRange = timePart || '';
  }

  isNextWeek: boolean = false; // Flag to detect if current week has no slots

  // Converts day name (e.g., Mon) to date object of upcoming day
  getDateForDay(day: string, referenceDate: Date = new Date()): Date {
    const daysOfWeek: { [key: string]: number } = {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };
    const normalizedDay = day.toLowerCase().trim();
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);
    const targetDayIndex = daysOfWeek[normalizedDay];
    if (targetDayIndex === undefined) return new Date(NaN);
    const dayOffset = (targetDayIndex - today.getDay() + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    return targetDate;
  }

  // Filters available days for current week; if none, load next week
  filterDaysForCurrentWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    this.filteredDays = this.availableDays.map(day => {
      const date = this.getDateForDay(day, today);
      return isNaN(date.getTime()) ? null : {
        day,
        date,
        fullDate: formatDate(date, 'fullDate', 'en-US'),
        formattedDate: formatDate(date, 'yyyy-MM-dd', 'en-US'),
      };
    }).filter(day => day && day.date >= startOfWeek && day.date <= endOfWeek);

    if (this.filteredDays.length === 0) {
      const nextWeekStart = new Date(startOfWeek);
      nextWeekStart.setDate(startOfWeek.getDate() + 7);

      this.filteredDays = this.availableDays.map(day => {
        const date = this.getDateForDay(day, nextWeekStart);
        return isNaN(date.getTime()) ? null : {
          day,
          date,
          fullDate: formatDate(date, 'fullDate', 'en-US'),
          formattedDate: formatDate(date, 'yyyy-MM-dd', 'en-US'),
        };
      }).filter(day => day);
      this.isNextWeek = true;
    } else {
      this.isNextWeek = false;
    }
  }

  // When a day is selected, generate a Jitsi link for online meetings
  onDaySelected(event: Event) {
    const selectedDate = (event.target as HTMLSelectElement).value;
    this.selectedDay = selectedDate;
    const doctorId = this.doctorId ?? '';
    const patientId = this.patientId ?? '';
    if (!doctorId || !patientId || !selectedDate) return;

    const roomName = `carepath-${doctorId}-${patientId}-${selectedDate}`.replace(/[^a-zA-Z0-9\-]/g, '');
    this.meetingLink = `https://meet.jit.si/${roomName}`;
    this.selectedMeetingLink = this.meetingLink;

    this.tryRenderPayPal();
  }

  // Called when a clinic is selected (in-person only)
  onClinicSelected(event: any) {
    this.selectedClinicId = event.target.value;
    this.tryRenderPayPal();
  }

  // Calculates total and base consultation fees
  calculateTotalFee() {
    const consultationFee = parseFloat(this.doctorProfile?.ConsultationFee || '0');
    const clinicFee = this.doctorProfile?.ConsultationType?.toLowerCase() === 'online'
      ? 0
      : parseFloat(this.doctorProfile?.ClinicFee || '0');
    const serviceCharge = 250;
    this.btotalFee = consultationFee + clinicFee;
    this.totalFee = consultationFee + clinicFee + serviceCharge;
  }

  // Validates form state before showing PayPal button
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

  // Dynamically loads the PayPal SDK
  loadPayPalScript() {
    if (document.getElementById('paypal-sdk')) return;
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD';
    script.async = true;
    script.onload = () => this.tryRenderPayPal();
    document.body.appendChild(script);
  }

  // Checks if PayPal should render and initializes it
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

  // PayPal Button setup and payment handling
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
        this.saveBookingAndInvoice();
        return details;
      },
      onError: (err: any) => {
        console.error('PayPal payment error:', err);
        alert('Payment failed.');
      }
    }).render(this.paypalContainerRef.nativeElement);
  }

  // Books the appointment in the backend
  bookAppointment(appointmentData: any) {
    this.dataService.bookAppointment(appointmentData).subscribe(
      () => alert('Booking saved successfully!'),
      (error) => {
        console.error('Error saving booking:', error);
        alert('Booking failed to save.');
      }
    );
  }

  // Saves the invoice in the backend
  saveBookingAndInvoice(): void {
    const invoiceData = {
      Did: this.doctorId,
      Pid: this.patientId,
      IssuedDate: this.selectedDay,
      PaymentStatus: 'Paid',
      PaymentMethod: 'PayPal',
      TotalAmount: this.btotalFee,
      FinalAmount: this.totalFee,
      Discount: 0.0,
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

  // Stores the generated meeting link for online bookings
  meetingLink: string = '';

}
