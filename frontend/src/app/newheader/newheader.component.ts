import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service'; // Correct import
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nheader',
  imports: [RouterModule], // ✅ Added RouterModule for routing
  standalone: true,
  templateUrl: './newheader.component.html',
  styleUrls: ['./newheader.component.css']
})
export class NewheaderComponent implements OnInit {
  user: any;

  constructor(private router: Router, private dataService: DataService) {} // Inject DataService

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  logout(): void {
    this.dataService.checkDoctorSession().subscribe({
      next: (doctorResponse: any) => {
        if (doctorResponse === true) {
          this.dataService.doctorLogout().subscribe({
            next: () => {
              this.completeLogout();  // Call completeLogout after doctor logout success
            },
            error: () => {
              this.completeLogout();  // Call completeLogout even if there's an error during doctor logout
            }
          });
        } else {
          this.checkPatientSession();
        }
      },
      error: () => {
        this.checkPatientSession();  // Proceed to check for patient session in case of error
      }
    });
  }

  private checkPatientSession(): void {
    this.dataService.checkPatientSession().subscribe({
      next: (userResponse: any) => {
        if (userResponse === true) {
          this.dataService.patientLogout().subscribe({
            next: () => {
              this.completeLogout();  // Call completeLogout after patient logout success
            },
            error: () => {
              this.completeLogout();  // Call completeLogout even if there's an error during patient logout
            }
          });
        } else {
          this.completeLogout();  // No session for either doctor or patient
        }
      },
      error: () => {
        this.completeLogout();  // Proceed to complete logout if checking session fails
      }
    });
  }

  private completeLogout(): void {
    sessionStorage.removeItem('user'); // Clear session storage
    this.router.navigate(['/login']); // Redirect to login page
  }
}
