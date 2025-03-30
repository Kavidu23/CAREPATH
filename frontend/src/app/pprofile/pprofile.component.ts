import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { NewheaderComponent } from "../newheader/newheader.component";
import { DataService } from '../data.service'; // Assuming you have a DataService
import { Router } from '@angular/router';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-pprofile',
  standalone: true,
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
  patientProfile = {
    patientId: undefined as number | undefined,
    firstName: '',
    lastName: '',
    image: '',
    gender: '',
    age: ''
  };

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatientProfile();
  }

  private loadPatientProfile(): void {
    this.dataService.getPatientProfile().subscribe({
      next: (data: any) => {
        const profileData = data?.user || data; // Handle nested user object
        console.log('Raw profile data:', profileData);

        this.patientProfile = {
          patientId: profileData.Pid || profileData.pid || profileData.id || undefined,
          firstName: profileData.Fname || profileData.firstName || 'N/A',
          lastName: profileData.Lname || profileData.lastName || 'N/A',
          image: profileData.Image || profileData.image || '',
          gender: profileData.Gender || profileData.gender || 'N/A',
          age: profileData.Age || profileData.age || 'N/A'
        };

        console.log('Loaded patient profile:', this.patientProfile);
      },
      error: (err) => {
        console.error('Failed to load patient profile:', err);
        alert('Failed to load profile. Please try again.');
      }
    });
  }

  changePassword(): void {
    // Navigate to a password change page or open a modal
    this.router.navigate(['/change-password']);
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.dataService.deletePatientAccount().subscribe({
        next: () => {
          alert('Account deleted successfully.');
          this.router.navigate(['/login']); // Redirect to login page
        },
        error: (err) => {
          console.error('Failed to delete account:', err);
          alert('Failed to delete account. Please try again.');
        }
      });
    }
  }
}