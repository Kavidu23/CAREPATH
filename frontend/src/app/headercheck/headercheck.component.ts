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
  isDoctor: boolean = false; // New variable for doctor session check

  constructor(private DataService: DataService) { }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  // Check if the session belongs to a logged-in patient or doctor
  checkLoginStatus(): void {
    this.DataService.checkPatientSession().subscribe(
      (response) => {
        this.isLoggedIn = response === true;
      },
      (error) => {
        this.isLoggedIn = false;
      }
    );

    // Check if the session belongs to a doctor
    this.DataService.checkDoctorSession().subscribe(
      (response) => {
        this.isDoctor = response === true;
      },
      (error) => {
        this.isDoctor = false;
      }
    );
  }
}
