import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { NewheaderComponent } from "../newheader/newheader.component";
import { DataService } from '../data.service'; // Assuming you have a DataService
import { Router } from '@angular/router';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-dprofile',
  standalone: true,
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
  doctorProfile = {
    doctorId: undefined as number | undefined,
    firstName: '',
    lastName: '',
    image: '',
    specialty: '',
  };

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDoctorProfile();
  }

  private loadDoctorProfile(): void {
    this.dataService.getDoctorProfile().subscribe({
      next: (data: any) => {
        const profileData = data?.user || data; // Handle nested user object
        console.log('Raw profile data:', profileData);

        this.doctorProfile = {
          doctorId: profileData.Did || profileData.did || profileData.id || undefined,
          firstName: profileData.Fname || profileData.firstName || 'N/A',
          lastName: profileData.Lname || profileData.lastName || 'N/A',
          image: profileData.Image || profileData.image || '',
          specialty: profileData.Specialization || profileData.Specialization || 'N/A',
        };

        console.log('Loaded doctor profile:', this.doctorProfile);
      },
      error: (err) => {
        console.error('Failed to load doctor profile:', err);
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
      this.dataService.deleteDoctorAccount().subscribe({
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
