import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';

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

  constructor(private dataService: DataService, private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';
  
    if (!this.email || !this.password) {
      this.errorMessage = 'Both email and password are required.';
      return;
    }
  
    this.dataService.login(this.email, this.password).subscribe(
      (response) => {
        console.log('Patient Login successful', response);
        this.successMessage = 'Login successful! Redirecting...';
  
        setTimeout(() => {
          this.router.navigate(['/patient-dashboard']);
        }, 2000);
      },
      (error) => {
        console.error('Patient Login failed', error);
  
        if (error.status === 409) {
          this.errorMessage = 'You are already logged in. Redirecting to your dashboard...';
          setTimeout(() => {
            this.router.navigate(['/patient-dashboard']);
          }, 2000);
        }
      }
    );
  }
  
  
  
  
}
