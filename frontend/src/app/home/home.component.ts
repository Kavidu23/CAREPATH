import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../data.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewheaderComponent } from "../newheader/newheader.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, CommonModule, FormsModule, NewheaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  psychiatryCount: number = 0;
  endocrinologyCount: number = 0;
  pulmonologyCount: number = 0;
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

  constructor(
    private dataService: DataService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Load public data regardless of login status
    this.loadSpecialtyData();
    this.loadNewlyRegisteredDoctors();
    this.loadTestimonials();

    // Check session only if running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadSessionUser();
    }
  }

  loadSessionUser() {
    const sessionData = sessionStorage.getItem('user'); // Retrieve session data from sessionStorage
    if (sessionData) {
      this.user = JSON.parse(sessionData);
      console.log('Session user found:', this.user);
    } else {
      console.log('No session found, user is not logged in.');
      this.user = null;
    }
  }

  logout(): void {
    sessionStorage.removeItem('user'); // Remove session data
    this.user = null; // Clear user data
    this.router.navigate(['/login']); // Redirect to login page
  }

  loadSpecialtyData() {
    this.dataService.getDoctorCounts().subscribe(
      (data) => {
        data.forEach((specialty: { Specialization: string, doctorCount: number }) => {
          switch (specialty.Specialization.toLowerCase()) {
            case 'psychiatry':
              this.psychiatryCount = specialty.doctorCount;
              break;
            case 'endocrinology':
              this.endocrinologyCount = specialty.doctorCount;
              break;
            case 'pulmonology':
              this.pulmonologyCount = specialty.doctorCount;
              break;
            case 'urology':
              this.urologyCount = specialty.doctorCount;
              break;
            case 'neurology':
              this.neurologyCount = specialty.doctorCount;
              break;
            case 'cardiology':
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
