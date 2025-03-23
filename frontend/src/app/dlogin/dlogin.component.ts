import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { HeaderComponent } from '../header/header.component'; // Import HeaderComponent
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dlogin',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, RouterModule], // Add CommonModule for ngIf support
  templateUrl: './dlogin.component.html',
  styleUrls: ['./dlogin.component.css']
})
export class DloginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private dataService: DataService, private router: Router) {}

  onLogin(): void {
  this.errorMessage = '';
  this.successMessage = '';

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

  
}
