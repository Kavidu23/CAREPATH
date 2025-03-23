import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { DataService } from '../data.service'; // Import DataService
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { NewheaderComponent } from '../newheader/newheader.component';

@Component({
  selector: 'app-d-dashboard',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule,NewheaderComponent], // Add CommonModule for directives
  templateUrl: './d-dashboard.component.html',
  styleUrls: ['./d-dashboard.component.css']
})
export class DDashboardComponent implements OnInit {
  // Properties to hold fetched data
  doctorProfile: any = {};
  upcomingAppointments: any[] = [];
  clinicsAvailability: any[] = [];
  bankDetails: any = {};
  appointments: any[] = [];
  medicalRecords: any[] = [];
  prescriptions: any[] = [];
  invoices: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Fetch all required data on initialization
    this.loadDoctorProfile();
    this.loadUpcomingAppointments();
    this.loadClinicsAvailability();
    this.loadBankDetails();
    this.loadReports();
  }

  loadDoctorProfile(): void {
    this.dataService.getDoctorProfile().subscribe(
      (data) => {
        this.doctorProfile = data;
        console.log('Doctor Profile:', this.doctorProfile);
      },
      (error) => console.error('Error fetching doctor profile:', error)
    );
  }

  loadUpcomingAppointments(): void {
    this.dataService.getUpcomingAppointments().subscribe(
      (data) => {
        this.upcomingAppointments = data;
      },
      (error) => console.error('Error fetching upcoming appointments:', error)
    );
  }

  loadClinicsAvailability(): void {
    this.dataService.getClinicsAvailability().subscribe(
      (data) => {
        this.clinicsAvailability = data;
      },
      (error) => console.error('Error fetching clinics availability:', error)
    );
  }

  loadBankDetails(): void {
    this.dataService.getBankDetails().subscribe(
      (data) => {
        this.bankDetails = data;
      },
      (error) => console.error('Error fetching bank details:', error)
    );
  }

  loadReports(): void {
    // Appointments
    this.dataService.getAppointments().subscribe(
      (data) => this.appointments = data,
      (error) => console.error('Error fetching appointments:', error)
    );

    // Medical Records
    this.dataService.getMedicalRecords().subscribe(
      (data) => this.medicalRecords = data,
      (error) => console.error('Error fetching medical records:', error)
    );

    // Prescriptions
    this.dataService.getPrescriptions().subscribe(
      (data) => this.prescriptions = data,
      (error) => console.error('Error fetching prescriptions:', error)
    );

    // Invoices
    this.dataService.getInvoices().subscribe(
      (data) => this.invoices = data,
      (error) => console.error('Error fetching invoices:', error)
    );
  }
}