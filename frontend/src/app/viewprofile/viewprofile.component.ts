import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';  // Ensure to use the correct import path
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngFor and other common directives
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-viewprofile',
  standalone: true,
  imports: [HeadercheckComponent, FooterComponent, CommonModule],  // Add CommonModule here
  templateUrl: './viewprofile.component.html',
  styleUrls: ['./viewprofile.component.css']
})
export class ViewprofileComponent implements OnInit {
  doctor: any;  // Define a doctor property to hold the data
  doctorId: string = ''; // Define a property to store the doctor ID

  constructor(private router: Router, private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get the doctor ID from the query parameters or route (if available)
    this.doctorId = this.getDoctorIdFromRoute();
    // Fetch doctor data using the dataService or any other logic
    this.getDoctorProfile(this.doctorId);
  }

  // Method to fetch doctor profile data
  getDoctorProfile(doctorId: string): void {
    this.dataService.getDoctorByID(doctorId).subscribe((data: any) => {
      this.doctor = data;
      console.log(data); // Store the data
    });
  }

  // Helper method to get the doctor ID from route query params
  getDoctorIdFromRoute(): string {
    return this.route.snapshot.queryParamMap.get('Did') || '';  // Get 'Did' from query params using ActivatedRoute
  }

  // Method to navigate to the booking page
  bookAppointment(): void {
    if (this.doctorId) {
      this.router.navigate(['/book-now'], { queryParams: { Did: this.doctorId } });
      console.log('Booking appointment...');
    }
  }
}
