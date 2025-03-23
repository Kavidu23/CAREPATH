import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API requests

@Component({
  selector: 'app-nheader',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add CommonModule here
  templateUrl: './newheader.component.html',
  styleUrls: ['./newheader.component.css']
})
export class NewheaderComponent implements OnInit {
  user: any; // To hold user data

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // Retrieve user data from sessionStorage if running in the browser
      const userData = sessionStorage.getItem('user');
      
      if (userData) {
        this.user = JSON.parse(userData); // Parse and store user data
      }
    }
  }

  // Method to logout and destroy the session
  logout(): void {
    // First, make a POST request to the backend to destroy the session
    this.http.post('http://localhost:3000/doctor/logout', {}, { withCredentials: true }) // Make POST request to backend logout route
      .subscribe({
        next: (response) => {
          console.log('Backend session destroyed:', response);
          
          // Clear sessionStorage to remove user data from the frontend
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem('user');
          }
          
          // Redirect to the login page
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error during logout:', err);
        }
      });
  }
  
}
