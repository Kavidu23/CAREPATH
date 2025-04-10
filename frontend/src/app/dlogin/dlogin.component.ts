import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { HeaderComponent } from '../header/header.component'; // Import HeaderComponent
import { RouterModule } from '@angular/router';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-dlogin',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, RouterModule, HeadercheckComponent], // Add CommonModule for ngIf support
  templateUrl: './dlogin.component.html',
  styleUrls: ['./dlogin.component.css']
})
export class DloginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  failedAttempts: number = 0; // Track failed login attempts
  isButtonDisabled: boolean = false; // Disable the button after 3 failed attempts
  disableTime: number = 10; // Time to disable button after 3 failed attempts (in seconds)
  
  constructor(private dataService: DataService, private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // If the button is disabled due to too many failed attempts
    if (this.isButtonDisabled) {
      this.errorMessage = `Too many failed attempts. Try again in ${this.disableTime} seconds.`;
      return;
    }

    // Validate email and password (form validation)
    if (!this.email || !this.password) {
      this.errorMessage = 'Both email and password are required.';
      return;
    }

    // Call doctor login service
    this.dataService.doctorLogin(this.email, this.password).subscribe(
      (response) => {
        console.log('Doctor Login successful', response);
        this.successMessage = 'Login successful! Redirecting...';

        // Redirect to the doctor dashboard after a short delay
        setTimeout(() => {
          this.router.navigate(['/doctor-dashboard']);
        }, 2000);
      },
      (error) => {
        console.error('Doctor Login failed', error);

        // Increment failed login attempt count
        this.failedAttempts++;

        if (this.failedAttempts >= 3) {
          // Disable the login button after 3 failed attempts
          this.isButtonDisabled = true;
          this.errorMessage = `Too many failed attempts. Try again in ${this.disableTime} seconds.`;

          // Re-enable the button after the specified time (10 seconds)
          setTimeout(() => {
            this.isButtonDisabled = false;
            this.failedAttempts = 0; // Reset failed attempts
          }, this.disableTime * 1000);
          return;
        }

        // Handle API error response
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.status === 400 && error.error.message === 'Doctor already logged in') {
          // Handle the case when doctor is already logged in
          this.errorMessage = 'You are already logged in. Redirecting to your dashboard...';

          // Redirect to the doctor dashboard after a short delay
          setTimeout(() => {
            this.router.navigate(['/doctor-dashboard']);
          }, 2000);
        } else if (error.status === 400) {
          this.errorMessage = 'All fields are required.';
        } else {
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      }
    );
  }

  // Navigate to the forgot password page
  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']); // Adjust the path as per your routes
  }
}
