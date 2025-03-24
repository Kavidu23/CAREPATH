import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service'; // Correct import

@Component({
  selector: 'app-nheader',
  standalone: true,
  templateUrl: './newheader.component.html',
  styleUrls: ['./newheader.component.css']
})
export class NewheaderComponent implements OnInit {
  user: any;

  constructor(private router: Router, private dataService: DataService) {} // Inject DataService

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  logout(): void {
    this.dataService.checkDoctorSession().subscribe({
      next: (doctorResponse: any) => {
        if (doctorResponse === true) {
          this.dataService.doctorLogout().subscribe({
            next: () => this.completeLogout(),
            error: () => this.completeLogout()
          });
        } else {
          this.checkPatientSession();
        }
      },
      error: () => {
        this.checkPatientSession();
      }
    });
  }

  private checkPatientSession(): void {
    this.dataService.checkPatientSession().subscribe({
      next: (userResponse: any) => {
        if (userResponse === true) {
          this.dataService.patientLogout().subscribe({
            next: () => this.completeLogout(),
            error: () => this.completeLogout()
          });
        } else {
          this.completeLogout();
        }
      },
      error: () => {
        this.completeLogout();
      }
    });
  }

  private completeLogout(): void {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
