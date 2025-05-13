import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { NewheaderComponent } from "../newheader/newheader.component";
import { DataService } from '../data.service'; // Service for API interactions
import { Router } from '@angular/router';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-pprofile',
  standalone: true,
  // Declaring modules and components used in this component
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    NewheaderComponent,
    HeadercheckComponent
  ],
  templateUrl: './pprofile.component.html',
  styleUrls: ['./pprofile.component.css']
})
export class PprofileComponent implements OnInit {

  // Patient profile object with default or empty values
  patientProfile = {
    patientId: undefined as number | undefined,
    firstName: '',
    lastName: '',
    image: '',
    gender: '',
    age: ''
  };

  // Injecting required services: DataService for data fetching, Router for navigation
  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  // Angular lifecycle hook: triggers after component is initialized
  ngOnInit(): void {
    this.loadPatientProfile(); // Load patient data on initialization
  }

  // Fetches patient profile data from the backend
  private loadPatientProfile(): void {
    this.dataService.getPatientProfile().subscribe({
      next: (data: any) => {
        // Support for both nested and flat user response structures
        const profileData = data?.user || data;
        console.log('Raw profile data:', profileData); // Debug log

        // Mapping received data to component’s patientProfile object
        this.patientProfile = {
          patientId: profileData.Pid || profileData.pid || profileData.id || undefined,
          firstName: profileData.Fname || profileData.firstName || 'N/A',
          lastName: profileData.Lname || profileData.lastName || 'N/A',
          image: profileData.Image || profileData.image || '',
          gender: profileData.Gender || profileData.gender || 'N/A',
          age: profileData.Age || profileData.age || 'N/A'
        };

        console.log('Loaded patient profile:', this.patientProfile); // Debug log
      },
      error: (err) => {
        // Handle API errors and inform the user
        console.error('Failed to load patient profile:', err);
        alert('Failed to load profile. Please try again.');
      }
    });
  }

  // Navigates user to the change password page
  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  // Deletes the patient's account after confirmation
  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.dataService.deletePatientAccount().subscribe({
        next: () => {
          alert('Account deleted successfully.');
          this.router.navigate(['/login']); // Redirect user to login page after deletion
        },
        error: (err) => {
          console.error('Failed to delete account:', err);
          alert('Failed to delete account. Please try again.');
        }
      });
    }
  }
}
