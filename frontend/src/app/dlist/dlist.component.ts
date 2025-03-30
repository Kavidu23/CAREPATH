import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Required for [(ngModel)]
import { CommonModule } from '@angular/common'; // Required for *ngFor, *ngIf
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { DataService } from '../data.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, HeadercheckComponent], // Ensure required modules are included
  templateUrl: './dlist.component.html',
  styleUrls: ['./dlist.component.css']
})
export class DlistComponent implements OnInit {
  doctors: any[] = []; // Holds doctor data

  filtersList = [
    {
      title: 'Specialization',
      key: 'specialization',
      options: [
        { label: 'Cardiologist', value: 'Cardiologist', selected: false },
        { label: 'Neurologist', value: 'Neurologist', selected: false },
        { label: 'Pediatrician', value: 'Pediatrician', selected: false }
      ]
    },
    {
      title: 'Gender',
      key: 'gender',
      options: [
        { label: 'Male', value: 'Male', selected: false },
        { label: 'Female', value: 'Female', selected: false }
      ]
    },
    {
      title: 'Availability',
      key: 'availability',
      options: [
        { label: 'Today', value: 'today', selected: false },
        { label: 'Tomorrow', value: 'tomorrow', selected: false }
      ]
    }
  ];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadDoctors(); // Load available doctors initially
  }

  loadDoctors() {
    this.dataService.getDoctors({}).subscribe(data => {
      this.doctors = data;
    });
  }

  
  applyFilters() {
    let filters: any = {};
  
    this.filtersList.forEach(filter => {
      let selectedValues = filter.options.filter(opt => opt.selected).map(opt => opt.value);
      if (selectedValues.length > 0) {
        filters[filter.key] = selectedValues.join(',');
      }
    });
  
    const queryParams = new URLSearchParams(filters).toString(); // Convert filter object to query params string
  
    this.dataService.getDoctorsFiltered(queryParams).subscribe(data => {
      this.doctors = data;
      console.log('Doctors fetched: ', this.doctors);
    });
  }
     

  bookAppointment(doctor: any) {
    console.log('Booking appointment for', doctor);
  }
}
