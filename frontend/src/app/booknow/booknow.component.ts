declare global {
  interface Window {
    paypal: any;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { FooterComponent } from "../footer/footer.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booknow',
  standalone: true,
  templateUrl: './booknow.component.html',
  styleUrls: ['./booknow.component.css'],
  imports: [HeadercheckComponent, FooterComponent, CommonModule]
})
export class BooknowComponent implements OnInit, OnDestroy {
  doctorId: string | null = null;
  doctorProfile: any = null;
  availableDays: string[] = [];
  timeRange: string = '';
  totalFee: number = 0;
  serviceCharge: number = 0.1;
  selectedDay: string = '';
  selectedClinic: string = '';

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.queryParamMap.get('Did');
    if (this.doctorId) {
      this.getDoctorProfileById(this.doctorId);
    }

    this.initializePayPalButton();  // Initialize PayPal button
  }

  ngOnDestroy(): void {
    // Clean up if needed
  }

  // Fetch the doctor profile data from the backend
  getDoctorProfileById(doctorId: string) {
    this.dataService.getDoctorByID(doctorId).subscribe((data: any) => {
      this.doctorProfile = data;
      this.generateAvailableDaysAndTimeRange(this.doctorProfile?.Availability || '');
      this.calculateTotalFee();
      console.log(data);
    });
  }

  // Generate available days and time range from the doctor's availability
  generateAvailableDaysAndTimeRange(availability: string) {
    const parts = availability.split(' ');
    const daysPart = parts[0] || '';
    const timePart = parts[1] || '';
    const days = daysPart.includes('-') ? daysPart.split('-') : [daysPart];
    this.availableDays = days;
    this.timeRange = timePart;
  }

  initializePayPalButton() {
    try {
      if (typeof window !== 'undefined' && window['paypal']) {
        window['paypal'].Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: this.doctorProfile?.ConsultationFee || 0, // Set payment amount dynamically
                  },
                },
              ],
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              alert('Payment Successful!');
              // Optionally, call backend to save payment information, etc.
            });
          },
          onError: (err: any) => {
            console.error('PayPal payment error:', err);
            alert('Payment failed.');
          },
        }).render('#paypal-button-container'); // Render the button
      }
    } catch (error) {
      console.error('Error initializing PayPal button:', error);
    }
  }

  // Handle day selection
  onDaySelected(event: any) {
    this.selectedDay = event.target.value;
    console.log('Selected Day:', this.selectedDay);
  }

  // Handle clinic selection
  onClinicSelected(event: any) {
    this.selectedClinic = event.target.value;
    console.log('Selected Clinic:', this.selectedClinic);
  }

  // Define the makePayment method
  makePayment() {
    alert('Pay with PayPal clicked!');
  }

  // Calculate total fee including service charge
  calculateTotalFee() {
    const doctorFee = this.doctorProfile?.ConsultationFee || 0;
    const clinicFee = this.doctorProfile?.ClinicFee || 0;
    const serviceChargeAmount = (doctorFee + clinicFee) * this.serviceCharge;
    this.totalFee = doctorFee + clinicFee + serviceChargeAmount;
  }

  // Check if all required fields are filled before enabling the Pay button
  isFormValid(): boolean {
    return (
      this.selectedDay &&
      this.doctorProfile?.ConsultationFee && 
      this.doctorProfile?.ClinicFee &&
      this.totalFee > 0
    );
  }
}
