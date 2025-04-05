import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-booknow',
  standalone: true,
  imports: [CommonModule, FooterComponent, HeadercheckComponent],
  templateUrl: './booknow.component.html',
  styleUrls: ['./booknow.component.css']
})
export class BooknowComponent implements OnInit {
  doctorId: string | null = null;
  doctorProfile: any = null;
  availableDays: string[] = [];
  timeRange: string = '';
  stripePromise: Promise<Stripe | null>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private http: HttpClient
  ) {
    this.stripePromise = loadStripe('pk_test_YourPublicKeyHere'); // Replace with your Stripe public key
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.queryParamMap.get('Did');
    console.log('Doctor ID:', this.doctorId);

    if (this.doctorId) {
      this.getDoctorProfileById(this.doctorId);
    }
  }

  getDoctorProfileById(doctorId: string) {
    this.dataService.getDoctorByID(doctorId).subscribe((data) => {
      this.doctorProfile = data;
      console.log('Doctor Profile:', this.doctorProfile);
      this.generateAvailableDaysAndTimeRange(this.doctorProfile.Availability);
    });
  }

  generateAvailableDaysAndTimeRange(availability: string) {
    const daysPart = availability.split(' ')[0];
    const days = daysPart.split('-');
    this.availableDays = days.length === 1 ? [days[0]] : [days[0], days[1]];
    this.timeRange = availability.split(' ')[1];
  }

  onDaySelected(event: any) {
    const selectedDay = event.target.value;
    console.log('Selected Day:', selectedDay);
  }

  async makePayment() {
    const stripe = await this.stripePromise;

    this.http.post<any>('http://localhost:3000/create-checkout-session', {
      amount: this.doctorProfile.ConsultationFee * 100 // Stripe uses cents
    }).subscribe(async (session) => {
      const result = await stripe?.redirectToCheckout({
        sessionId: session.id
      });
      if (result?.error) {
        console.error(result.error.message);
      }
    });
  }
}
