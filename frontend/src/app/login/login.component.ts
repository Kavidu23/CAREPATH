import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { HeaderComponent } from '../header/header.component'; // Import HeaderComponent

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent], // Add CommonModule for ngIf support
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private dataService: DataService, private router: Router) {}

  onLogin(): void {
    // Clear any previous error or success messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate email and password (form validation)
    if (!this.email || !this.password) {
      this.errorMessage = 'Both email and password are required.';
      return;
    }

    // Prepare user data
    const userData = { Email: this.email, Password: this.password };

    // Call login service
    this.dataService.login(userData.Email, userData.Password).subscribe(
      (response) => {
        console.log('Login successful', response);
        this.successMessage = 'Login successful! Redirecting...';
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      (error) => {
        console.error('Login failed', error);
        
        // Handle API error response
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.status === 400) {
          this.errorMessage = 'All fields are required.';
        } else {
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      }
    );
  }
}
