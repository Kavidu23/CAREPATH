import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';  // Ensure to use the correct import path
import { CommonModule } from '@angular/common';  // Import CommonModule for *ngFor and other common directives
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { FooterComponent } from "../footer/footer.component";
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-viewprofile',
  standalone: true,
  imports: [HeadercheckComponent, FooterComponent, CommonModule, FormsModule, HeaderComponent],  // Add CommonModule here
  templateUrl: './webadmin.component.html',
  styleUrls: ['./webadmin.component.css']
})


export class WebAdminComponent implements OnInit {
  totalDoctorCount!: number;
  totalPatientCount!: number;
  selectedDoctorId!: string;
  allDoctors: any[] = [];
  clinicData = { Name: '', Location: '', Email: '', Pnumber: '', Fee: '' };
  adminData = { Username: '', Password: '', Email: '', Cid: '' };
  medicineData = { Name: '', Price: '', Description: '' };
  homecareData = { Name: '', Price: '', Description: '' };

  constructor(private dataService: DataService) { }
  clinics: any[] = [];

  ngOnInit(): void {
    this.getTotalCounts();
    this.getAllDoctors();
    this.dataService.getAllClinics().subscribe((data: any[]) => {
      this.clinics = data;
    });
  }

  getTotalCounts(): void {
    this.dataService.getTotalDoctorCount().subscribe(count => {
      this.totalDoctorCount = count.totalDoctors; // ✅ Extract the number from the object
    });


    this.dataService.getTotalPatientCount().subscribe(count => {
      this.totalPatientCount = count.totalCount; // match the exact key from API response
    });

  }

  getAllDoctors(): void {
    this.dataService.getAllDoctors().subscribe(doctors => {
      this.allDoctors = doctors;
    });
  }

  activateDoctor(): void {
    this.dataService.activateDoctor(this.selectedDoctorId).subscribe(response => {
      alert('Doctor activated successfully!');
      this.getAllDoctors();  // Refresh the doctor list
    });
  }

  deactivateDoctor(): void {
    this.dataService.deactivateDoctor(this.selectedDoctorId).subscribe(response => {
      alert('Doctor deactivated successfully!');
      this.getAllDoctors();  // Refresh the doctor list
    });
  }

  registerClinic(): void {
    this.dataService.registerNewClinic(this.clinicData).subscribe(response => {
      alert('Clinic registered successfully!');
      this.clinicData = {
        Name: '',
        Location: '',
        Email: '',
        Pnumber: '',
        Fee: ''
      };
    });
  }


  createClinicAdmin(): void {
    this.dataService.createNewClinicAdmin(this.adminData).subscribe(response => {
      alert('Clinic Admin created successfully!');
      this.adminData = {
        Username: '',
        Password: '',
        Email: '',
        Cid: ''
      };
    });
  }

  addMedicine(): void {
    this.dataService.addNewMedicine(this.medicineData).subscribe(response => {
      alert('Medicine added successfully!');
      // Reset the form fields
      this.medicineData = {
        Name: '',
        Price: '',
        Description: ''
      };
    });
  }


  addHomecare(): void {
    this.dataService.addHomeCare(this.homecareData).subscribe(response => {
      alert('Homecare service added successfully!');
      // Reset form data
      this.homecareData = {
        Name: '',
        Price: '',
        Description: ''
      };
    });
  }

}
