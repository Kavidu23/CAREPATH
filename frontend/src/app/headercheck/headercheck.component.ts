import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { NewheaderComponent } from "../newheader/newheader.component";
import { DataService } from '../data.service'; // Replace with your actual service path
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-headercheck',
  standalone: true,
  imports: [HeaderComponent, NewheaderComponent, CommonModule], // Add CommonModule here
  templateUrl: './headercheck.component.html',
  styleUrls: ['./headercheck.component.css']
})
export class HeadercheckComponent implements OnInit {

  isLoggedIn: boolean = false;

  constructor(private DataService: DataService) { }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  // Check if the session belongs to a logged-in patient
  checkLoginStatus(): void {
    this.DataService.checkPatientSession().subscribe(
      (response) => {
        // If the session is valid (true), set isLoggedIn to true
        this.isLoggedIn = response === true;
      },
      (error) => {
        // If there is an error (e.g., patient session not found), set isLoggedIn to false
        this.isLoggedIn = false;
      }
    );
  }
}
