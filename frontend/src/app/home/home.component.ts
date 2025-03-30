import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../data.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewheaderComponent } from "../newheader/newheader.component";
import { Observable } from 'rxjs';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, CommonModule, FormsModule, NewheaderComponent, HeadercheckComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ObstetricsCount: number = 0;
  DermatologistCount: number = 0;
  CardiologistCount: number = 0;
  urologyCount: number = 0;
  neurologyCount: number = 0;
  cardiologyCount: number = 0;

  newlyRegisteredDoctors: any[] = [];
  testimonials: any[] = [];
  searchType: string = '';
  searchLocation: string = '';
  searchResults: any[] = [];
  searchDebounceTimeout: any;
  user: any = null;
  isUserLoggedIn: boolean = false; // Track user session status
  isDoctorLoggedIn: boolean = false; // Track doctor session status

  constructor(
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  ngOnInit(): void {
    this.initializeData();
    this.loadUserSession(); // Load user session
    this.loadDoctorSession(); // Load doctor session
  }

  private initializeData(): void {
    this.loadSpecialtyData();
    this.loadNewlyRegisteredDoctors();
    this.loadTestimonials();
  }

  loadUserSession(): void {
    this.dataService.getUserSession().subscribe({
      next: (response) => {
        console.log('User session response:', response); // Log response to check the value
        this.isUserLoggedIn = response.loggedIn; // Set login status based on backend response
      },
      error: () => {
        this.isUserLoggedIn = false; // Set loggedIn to false in case of an error
        console.error('Error fetching user session');
      }
    });
  }

  loadDoctorSession(): void {
    this.dataService.getDoctorSession().subscribe({
      next: (response) => {
        console.log('Doctor session response:', response); // Log response to check the value
        this.isDoctorLoggedIn = response.loggedIn; // Set login status based on backend response
      },
      error: () => {
        this.isDoctorLoggedIn = false; // Set loggedIn to false in case of an error
        console.error('Error fetching doctor session');
      }
    });
  }




  loadSpecialtyData() {
    this.dataService.getDoctorCounts().subscribe(
      (data) => {
        data.forEach((specialty: { Specialization: string, doctorCount: number }) => {
          switch (specialty.Specialization) {
            case 'Obstetrics':
              this.ObstetricsCount = specialty.doctorCount;
              break;
            case 'Dermatologist':
              this.DermatologistCount = specialty.doctorCount;
              break;
            case 'Cardiologist':
              this.CardiologistCount = specialty.doctorCount;
              break;
            case 'Urologist':
              this.urologyCount = specialty.doctorCount;
              break;
            case 'Neurologist':
              this.neurologyCount = specialty.doctorCount;
              break;
            case 'Pediatrician':
              this.cardiologyCount = specialty.doctorCount;
              break;
            default:
              break;
          }
        });
      },
      (error) => {
        console.error('Error fetching doctor counts:', error);
      }
    );
  }

  loadNewlyRegisteredDoctors() {
    this.dataService.getNewlyRegisteredDoctors().subscribe(
      (data) => {
        this.newlyRegisteredDoctors = data;
      },
      (error) => {
        console.error('Error fetching newly registered doctors:', error);
      }
    );
  }

  loadTestimonials() {
    this.dataService.getTestimonials().subscribe(
      (data) => {
        this.testimonials = data;
      },
      (error) => {
        console.error('Error fetching testimonials:', error);
      }
    );
  }

  onSearch(): void {
    if (this.searchType || this.searchLocation) {
      const params = {
        type: this.searchType,
        location: this.searchLocation
      };

      this.dataService.searchDoctors(params).subscribe(
        (data) => {
          this.searchResults = data;
        },
        (error) => {
          console.error('Error fetching search results:', error);
          this.searchResults = [];
        }
      );
    } else {
      this.searchResults = [];
    }
  }

  onSearchTyping(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }

    this.searchDebounceTimeout = setTimeout(() => {
      this.onSearch();
    }, 300);
  }

  selectSuggestion(doctor: any): void {
    this.searchType = doctor.Specialization;
    this.searchLocation = doctor.Location;
    this.searchResults = [];
  }
}
