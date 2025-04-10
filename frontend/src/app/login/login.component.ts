import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; // Import AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  failedAttempts: number = 0; // Track failed login attempts
  isButtonDisabled: boolean = false; // Disable button after max attempts
  disableTime: number = 10; // Time to disable button after 3 attempts (in seconds)

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) {}

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    // If the button is disabled, return early
    if (this.isButtonDisabled) {
      this.errorMessage = `Too many failed attempts. Try again in ${this.disableTime} seconds.`;
      return;
    }

    // Check if the user is already logged in before proceeding
    this.authService.checkSession().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        // If already logged in, redirect immediately to doctor-list page
        this.router.navigate(['/doctor-list']);
        return;
      }

      // Proceed with login if not already logged in
      this.dataService.login(this.email, this.password).subscribe(
        (response) => {
          console.log('Patient Login successful', response);
          this.successMessage = 'Login successful! Redirecting...';

          setTimeout(() => {
            // Directly redirect to doctor-list page after successful login
            this.router.navigate(['/doctor-list']);
          }, 2000);
        },
        (error) => {
          console.error('Patient Login failed', error);

          // Increment failed login attempt count
          this.failedAttempts++;

          if (this.failedAttempts >= 3) {
            // Disable the login button after 3 failed attempts
            this.isButtonDisabled = true;
            this.errorMessage = `Too many failed attempts. Try again in ${this.disableTime} seconds.`;

            // Re-enable the button after the specified time
            setTimeout(() => {
              this.isButtonDisabled = false;
              this.failedAttempts = 0; // Optionally reset failed attempts
            }, this.disableTime * 1000);
            return;
          }

          if (error.status === 409) {
            this.errorMessage = 'You are already logged in. Redirecting to your dashboard...';
            setTimeout(() => {
              this.router.navigate(['/doctor-list']);
            }, 2000);
          } else if (error.status === 401) {
            // Password incorrect
            this.errorMessage = 'Incorrect email or password. Please try again.';
          } else {
            this.errorMessage = 'Login failed. Please try again later.';
          }
        }
      );
    });
  }
}
