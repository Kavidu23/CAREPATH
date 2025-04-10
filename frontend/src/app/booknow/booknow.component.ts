declare global {
  interface Window {
    paypal: any;
  }
}

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { FooterComponent } from "../footer/footer.component";
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  timeRange: string = '';
  totalFee: number = 0;
  serviceCharge: number = 0.1;
  selectedDay: string = '';
  selectedClinic: string = '';
  paypalRendered: boolean = false;

  @ViewChild('paypalContainer', { static: false }) paypalContainerRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.authService.checkSession().subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/login']);
      } else {
        this.doctorId = this.route.snapshot.queryParamMap.get('Did');
        if (this.doctorId) {
          this.getDoctorProfileById(this.doctorId);
        }

        if (isPlatformBrowser(this.platformId)) {
          this.loadPayPalScript();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.tryRenderPayPal();
  }

  ngOnDestroy(): void {
    // Clean up if needed
  }

  getDoctorProfileById(doctorId: string) {
    this.dataService.getDoctorByID(doctorId).subscribe((data: any) => {
      this.doctorProfile = data;
      this.generateAvailableDaysAndTimeRange(this.doctorProfile?.Availability || '');
      this.calculateTotalFee();
    });
  }

  generateAvailableDaysAndTimeRange(availability: string) {
    const parts = availability.split(' ');
    const daysPart = parts[0] || '';
    const timePart = parts[1] || '';
    const days = daysPart.includes('-') ? daysPart.split('-') : [daysPart];
    this.availableDays = days;
    this.timeRange = timePart;
  }

  onDaySelected(event: any) {
    this.selectedDay = event.target.value;
    this.tryRenderPayPal();
  }

  onClinicSelected(event: any) {
    this.selectedClinic = event.target.value;
    this.tryRenderPayPal();
  }

  calculateTotalFee() {
    const doctorFee = this.doctorProfile?.ConsultationFee || 0;
    const clinicFee = this.doctorProfile?.ClinicFee || 0;
    const serviceChargeAmount = (doctorFee + clinicFee) * this.serviceCharge;
    this.totalFee = doctorFee + clinicFee + serviceChargeAmount;
  }

  isFormValid(): boolean {
    return (
      this.selectedDay &&
      this.selectedClinic &&
      this.doctorProfile?.ConsultationFee &&
      this.doctorProfile?.ClinicFee &&
      this.totalFee > 0
    );
  }

  loadPayPalScript() {
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=ASI9jMlbfXIjgtpdE8d3UEyFGsD6Yfs1tW8zE9B9IxIqYPkWgHIs24x4NYFUPXyEppGJJoG8gsuvnZ--&currency=USD';
    script.async = true;
    script.onload = () => {
      this.tryRenderPayPal();
    };
    document.body.appendChild(script);
  }

  tryRenderPayPal() {
    setTimeout(() => {
      if (
        isPlatformBrowser(this.platformId) &&
        window.paypal &&
        this.isFormValid() &&
        this.paypalContainerRef &&
        this.paypalContainerRef.nativeElement &&
        !this.paypalRendered
      ) {
        this.paypalContainerRef.nativeElement.innerHTML = ''; // Clear previous button
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
              currency_code: 'USD',
            },
          }],
        });
      },
      onApprove: async (data: any, actions: any) => {
        const details = await actions.order.capture();
        alert('Payment Successful! Booking will now be saved.');

        const clinic = this.doctorProfile?.Clinics?.find((c: any) =>
          `${c.name} - ${c.location}` === this.selectedClinic
        );

        const bookingData = {
          doctorId: this.doctorId,
          selectedDay: this.selectedDay,
          selectedClinic: clinic,
          totalFee: this.totalFee,
          paymentStatus: 'Paid',
          paymentDetails: details,
        };

        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        const options = { headers: headers, withCredentials: true };

        this.http.post('http://localhost:3000/payment/bookings', bookingData, options)
          .subscribe(
            () => alert('Booking saved successfully!'),
            (error) => {
              console.error('Error saving booking:', error);
              alert('Booking failed to save.');
            }
          );
      },
      onError: (err: any) => {
        console.error('PayPal payment error:', err);
        alert('Payment failed.');
      }
    }).render(this.paypalContainerRef.nativeElement);
  }
}
