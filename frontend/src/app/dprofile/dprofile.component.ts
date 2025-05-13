import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { NewheaderComponent } from "../newheader/newheader.component";
import { DataService } from '../data.service'; // Service to fetch/update doctor data
import { Router } from '@angular/router';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-dprofile',
  standalone: true,
  // Importing required Angular modules and other components
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    NewheaderComponent,
    HeadercheckComponent
  ],
  templateUrl: './dprofile.component.html',
  styleUrls: ['./dprofile.component.css']
})
export class DprofileComponent implements OnInit {
  
  // Doctor profile object initialized with default or empty values
  doctorProfile = {
    doctorId: undefined as number | undefined,
    firstName: '',
    lastName: '',
    image: '',
    specialty: '',
  };

  // Injecting services needed: DataService for API calls, Router for navigation
  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  // Lifecycle hook - triggers on component initialization
  ngOnInit(): void {
    this.loadDoctorProfile(); // Load doctor data when component loads
  }

  // Method to fetch the doctor's profile from the backend via DataService
  private loadDoctorProfile(): void {
    this.dataService.getDoctorProfile().subscribe({
      next: (data: any) => {
        // Handle nested data structure if 'user' key exists
        const profileData = data?.user || data;
        console.log('Raw profile data:', profileData); // Debugging/logging

        // Mapping backend fields (with fallbacks) to local component properties
        this.doctorProfile = {
          doctorId: profileData.Did || profileData.did || profileData.id || undefined,
          firstName: profileData.Fname || profileData.firstName || 'N/A',
          lastName: profileData.Lname || profileData.lastName || 'N/A',
          image: profileData.Image || profileData.image || '',
          specialty: profileData.Specialization || profileData.specialization || 'N/A',
        };

        console.log('Loaded doctor profile:', this.doctorProfile); // Final data log
      },
      error: (err) => {
        // Error handler for failed profile fetch
        console.error('Failed to load doctor profile:', err);
        alert('Failed to load profile. Please try again.');
      }
    });
  }

  // Navigate to the password change page
  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  // Delete the doctor's account after confirmation
  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.dataService.deleteDoctorAccount().subscribe({
        next: () => {
          alert('Account deleted successfully.');
          this.router.navigate(['/login']); // Redirect to login after deletion
        },
        error: (err) => {
          console.error('Failed to delete account:', err);
          alert('Failed to delete account. Please try again.');
        }
      });
    }
  }
}

