import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { DataService } from '../data.service'; // ✅ Import the service
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Declare all specialty count variables here
  psychiatryCount: number = 0;
  endocrinologyCount: number = 0;
  pulmonologyCount: number = 0;
  urologyCount: number = 0;
  neurologyCount: number = 0;
  cardiologyCount: number = 0;

  // Store the newly registered doctors
  newlyRegisteredDoctors: any[] = [];

  // Store the testimonials
  testimonials: any[] = [];

  // Variables for search
  searchType: string = '';
  searchLocation: string = '';

  // Store the search results
  searchResults: any[] = [];

  // Debounce timer for search
  searchDebounceTimeout: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadSpecialtyData();
    this.loadNewlyRegisteredDoctors(); // Fetch newly registered doctors
    this.loadTestimonials(); // Fetch testimonials
  }

  // Load the doctor count data based on specialization
  loadSpecialtyData() {
    this.dataService.getDoctorCounts().subscribe(
      (data) => {
        // Manually map the API response to the individual specialty counts
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

  // Load the newly registered doctors
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

  // Load testimonials
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

  // Method to handle search
  onSearch(): void {
    // Only search if there's a value in at least one of the fields
    if (this.searchType || this.searchLocation) {
      const params = {
        type: this.searchType,
        location: this.searchLocation
      };

      this.dataService.searchDoctors(params).subscribe(
        (data) => {
          // Update search results
          this.searchResults = data;
          console.log('Search results:', this.searchResults);
        },
        (error) => {
          console.error('Error fetching search results:', error);
          this.searchResults = []; // Clear results in case of error
        }
      );
    } else {
      // Clear results when no search criteria
      this.searchResults = [];
    }
  }

  // Optional: Dynamically search as user types (you can call onSearch() inside ngModel change event)
  onSearchTyping(): void {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }

    // Debounce delay of 300ms before triggering the search
    this.searchDebounceTimeout = setTimeout(() => {
      this.onSearch();
    }, 300);
  }

  // Method to handle the selection of a search suggestion
  selectSuggestion(doctor: any): void {
    // When a suggestion is selected, populate the search fields with the selected doctor information
    this.searchType = doctor.Specialization; // Or whatever field makes sense
    this.searchLocation = doctor.Location; // Or whichever field makes sense
    this.searchResults = []; // Clear the search results dropdown
  }
}
