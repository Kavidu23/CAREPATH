import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './request-password-reset-component.component.html',
  styleUrls: ['./request-password-reset-component.component.css']
})
export class RequestPasswordResetComponent {
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

    this.dataService.requestPasswordReset(email).subscribe({
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