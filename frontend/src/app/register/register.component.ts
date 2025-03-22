import { Component } from '@angular/core';
import { DataService } from '../data.service';  // Import the DataService
import { Router } from '@angular/router'; // Import Router for navigation
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
  errorMessage: string = '';  // To store error message for display

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

  // Inject DataService and Router
  constructor(private dataService: DataService, private router: Router) { }

  // Image preview logic
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
      this.imageName = 'Choose a file'; // Reset text when no file is selected
    }
  }

  // Form submission logic
onSubmit(form: any): void {
  if (form.valid) {
    // Ensure confirmPassword matches password
    if (this.formData.Password !== this.formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Prepare the data to send, only including the image name
    const formDataToSend = { 
      ...this.formData, 
      Image: this.imageName // Only include image name, not base64 data
    };

    // Call the signup API via DataService
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



}
