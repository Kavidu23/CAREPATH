import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service'; // Adjust based on your file structure
import { FormsModule, NgForm } from '@angular/forms'; // Required for template-driven forms
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor, etc.
import { RouterLink } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { NewheaderComponent } from "../newheader/newheader.component";
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component"; // For routerLink directive

@Component({
  selector: 'app-dregistration',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, HeaderComponent, NewheaderComponent, FooterComponent, HeadercheckComponent], // Add necessary modules
  templateUrl: './dregistration.component.html',
  styleUrls: ['./dregistration.component.css']
})
export class DregistrationComponent {
  imageName: string = 'Choose a file';
  imageSrc: string = '';
  errorMessage: string = ''; // To display error message from API response

  // Property for Availability Days
  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDays: string[] = []; // Store selected days

  formData = {
    Fname: '',
    Lname: '',
    Pnumber: '',
    Email: '',
    Password: '',
    confirmPassword: '',
    Gender: '',
    ConsultationType: '',
    ConsultationFee: 0,   // Change to number
    Availability: '',     // Combined value of days and time range
    StartTime: '',        // Separate start time
    EndTime: '',          // Separate end time
    Image: '',
    YearExperience: 0,    // Change to number
    Degree: '',           // Will store comma-separated degrees
    Specialization: '',   // Will store comma-separated specializations
    Status: 0,            // Added to match stored procedure (default to 0)
    Location: '',
    CreatedAt: ''         // Optional, depending on backend requirements
  };
  

  constructor(private dataService: DataService, private router: Router) {}

  // Preview image function
  previewImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result; // Display preview
      };
      reader.readAsDataURL(file);
      this.imageName = file.name; // Store file name
      this.formData.Image = file.name; // Update formData
    } else {
      this.imageSrc = '';
      this.imageName = 'Choose a file';
      this.formData.Image = '';
    }
  }

  // Handle day checkbox changes
  onDayChange(day: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }
  }

  // Combine selected days and time range into Availability string
  combineAvailability(): string {
    if (this.selectedDays.length === 0 || !this.formData.StartTime || !this.formData.EndTime) {
      return '';
    }

    // Generate the availability string in "Monday-Friday 9AM-6PM" format
    const daysString = this.selectedDays.length > 1 
      ? `${this.selectedDays[0]}-${this.selectedDays[this.selectedDays.length - 1]}`
      : this.selectedDays[0];
    return `${daysString} ${this.formData.StartTime}-${this.formData.EndTime}`;
  }

  // On form submit
  onSubmit(form: NgForm): void {
    if (form.valid) {
      if (this.formData.Password !== this.formData.confirmPassword) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }

      // Combine availability
      this.formData.Availability = this.combineAvailability();
      if (!this.formData.Availability) {
        this.errorMessage = 'Please select availability days and times.';
        return;
      }

      // Prepare data to send (exclude confirmPassword)
      const { confirmPassword, StartTime, EndTime, ...formDataToSend } = this.formData;
      formDataToSend.ConsultationFee = Number(formDataToSend.ConsultationFee); // Ensure numeric type
      formDataToSend.YearExperience = Number(formDataToSend.YearExperience); // Ensure numeric type
      formDataToSend.CreatedAt = new Date().toISOString(); // Add timestamp

      // Call the service to sign up the doctor
      this.dataService.signUpDoctor(formDataToSend).subscribe({
        next: (response) => {
          console.log('Doctor registered successfully:', response);
          this.router.navigate(['/doctor-login']);
        },
        error: (error) => {
          console.error('Error during doctor signup:', error);
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
        }
      });
    } else {
      this.errorMessage = 'Please fill out all required fields correctly.';
    }
  }
}
