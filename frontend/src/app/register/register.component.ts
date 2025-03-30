import { Component } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, FooterComponent, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  imageName: string = 'Choose a file';
  imageSrc: string = '';
  errorMessage: string = ''; // Error message for user feedback
  maxBirthdate: string = ''; // To store the max allowed birthdate (2005-12-31)

  formData = {
    Fname: '',
    Lname: '',
    Pnumber: '',
    Email: '',
    Password: '',
    confirmPassword: '',
    Location: '',
    Gender: '',
    Birthdate: ''
  };

  constructor(private dataService: DataService, private router: Router) { 
    this.setMaxBirthdate();
  }

  setMaxBirthdate(): void {
    // Restrict birthdate selection to 31st Dec 2005 or earlier
    const maxYear = 2005;
    this.maxBirthdate = `${maxYear}-12-31`;
  }

  previewImage(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(file);
      this.imageName = file.name;
    } else {
      this.imageSrc = '';
      this.imageName = 'Choose a file';
    }
  }

  onSubmit(form: any): void {
    this.errorMessage = ''; // Reset error message

    if (!form.valid) {
      this.errorMessage = "Please fill in all required fields correctly.";
      return;
    }

    // Password validation (between 4 and 6 characters)
    if (this.formData.Password.length < 4 || this.formData.Password.length > 6) {
      this.errorMessage = "Password must be between 4 and 6 characters.";
      return;
    }

    // Confirm Password validation
    if (this.formData.Password !== this.formData.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }

    // Phone Number validation (must be exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(this.formData.Pnumber)) {
      this.errorMessage = "Phone number must be exactly 10 digits (no '+' or special characters).";
      return;
    }

    // Birthdate validation (must be 2005 or earlier)
    if (this.formData.Birthdate > this.maxBirthdate) {
      this.errorMessage = "Birth year must be 2005 or earlier.";
      return;
    }

    // Prepare data
    const formDataToSend = { 
      ...this.formData, 
      Image: this.imageName 
    };

    this.dataService.signUp(formDataToSend).subscribe(
      (response) => {
        console.log('User registered successfully:', response);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error during signup:', error);
        this.errorMessage = error.message || 'Signup failed. Please try again.';
      }
    );
  }
}
