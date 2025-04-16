import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../data.service';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-clinic-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    FooterComponent,
    HeaderComponent
],
  templateUrl: './clinicadmin.component.html',
  styleUrls: ['./clinicadmin.component.css']
})
export class ClinicAdminComponent implements OnInit {
  clinicDetails: any;
  registeredDoctors: any[] = [];
  todayPatientCount: number = 0;
  newDoctorId: string = '';
  clinicId: string = '';

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.fetchClinicSession(); // Fetch session-stored admin info and initialize data
  }

  fetchClinicSession(): void {
    this.dataService.getSessionAdmin().subscribe({
      next: (admin) => {
        if (admin && admin.Cid) {
          this.clinicId = admin.Cid;
          this.loadClinicDetails();
          this.loadRegisteredDoctors();
          this.loadTodayPatientCount();
        } else {
          alert('You are not logged in as clinic admin');
        }
      },
      error: (err) => {
        console.error('Failed to fetch session admin:', err);
        alert('Please login again.');
        window.location.href = '/admin-login'; // Redirect to the admin login page
      }
    });
  }

  // Load clinic details by the clinicId
  loadClinicDetails(): void {
    this.dataService.getClinicById(this.clinicId).subscribe({
      next: (data) => {
        this.clinicDetails = data;
      },
      error: (err) => {
        console.error('Error loading clinic details:', err);
        alert('Failed to load clinic details');
      }
    });
  }

  // Load registered doctors for the current clinic
  loadRegisteredDoctors(): void {
    this.dataService.getDoctorsByClinic().subscribe({
      next: (data) => {
        this.registeredDoctors = data;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        alert('Failed to load registered doctors');
      }
    });
  }

  // Load today's patient count for the current clinic
  loadTodayPatientCount(): void {
    this.dataService.getTodayPatientCount().subscribe({
      next: (data) => {
        this.todayPatientCount = data.length; // Assuming data is an array
      },
      error: (err) => {
        console.error('Error loading patient count:', err);
        alert('Failed to load patient count');
      }
    });
  }

  // Approve a doctor for the clinic
  approveDoctor(): void {
    if (!this.newDoctorId.trim()) {
      alert('Please enter a valid Doctor ID');
      return;
    }

    const payload = { Did: this.newDoctorId };
    this.dataService.insertIntoClinic(payload).subscribe({
      next: () => {
        alert('Doctor approved successfully!');
        this.newDoctorId = ''; // Clear input field
        this.loadRegisteredDoctors(); // Refresh the list of registered doctors
      },
      error: (err) => {
        alert('Error approving doctor: ' + err.message);
      }
    });
  }
}
