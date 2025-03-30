import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule here if standalone is used
import { DataService } from '../data.service'; // Import your service
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { CommonModule } from '@angular/common';  // Import CommonModule

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [FormsModule, HeaderComponent, FooterComponent, HeadercheckComponent, CommonModule], // Add CommonModule here
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  rating: number = 0;
  comments: string = '';
  successMessage: string = '';

  constructor(private dataService: DataService) { } // Inject the service

  ngOnInit(): void { }

  // Function to handle rating selection (1 to 5 stars)
  setRating(value: number): void {
    
    this.rating = value;
  }

  // Submit feedback to the backend using the service
  submitFeedback(): void {
    if (this.rating < 1 || this.rating > 5 || !this.comments) {
      alert('Please provide a rating between 1 and 5 and comments.');
      return;
    }

    // Prepare the data for submission
    const feedbackData = {
      message: this.comments,
      rating: this.rating
    };

    // Call the service to submit feedback
    this.dataService.submitFeedback(feedbackData).subscribe(
      (response) => {
        this.successMessage = 'Thank you for your feedback!';
        this.comments = ''; // Clear comments after success
        this.rating = 0; // Reset rating
      },
      (error) => {
        alert('Failed to submit feedback. Please try again later.');
        console.error('Error submitting feedback', error);
      }
    );
  }
}
