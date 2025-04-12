import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-password-resett',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password-doctor.component.html',
  styleUrls: ['./reset-password-doctor.component.css']
})
export class ResetPasswordDoctorComponent {
  resetRequestForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resetRequestForm.invalid) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const email = this.resetRequestForm.get('email')?.value;

    this.dataService.doctorResetPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/emailpassword'], { queryParams: { email } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send reset email. Please try again.';
      }
    });
  }
}