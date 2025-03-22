import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common'; // Import CommonModule
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nheader',
  standalone: true,
  imports: [CommonModule,RouterModule], // Add CommonModule here
  templateUrl: './newheader.component.html',
  styleUrls: ['./newheader.component.css']
})
export class NewheaderComponent implements OnInit {
  user: any; // To hold user data

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Retrieve user data from sessionStorage
    const userData = sessionStorage.getItem('user');
    
    if (userData) {
      this.user = JSON.parse(userData); // Parse and store user data
    }
  }

  // Method to logout and destroy the session
  logout(): void {
    // Clear sessionStorage to remove user data
    sessionStorage.removeItem('user');
    
    // Redirect to the login page
    this.router.navigate(['/login']);
  }
}
