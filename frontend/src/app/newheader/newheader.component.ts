import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nheader',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './newheader.component.html',
  styleUrls: ['./newheader.component.css']
})
export class NewheaderComponent implements OnInit {
  user: any = {};
  pid: number | null = null;
  appointmentCount: number = 0;
  appointmentInfo: string = ''; // Tooltip text for remaining time
  showTooltip: boolean = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }

    this.fetchPatientImage();
    this.fetchPatientId();
    this.fetchAppointmentNotification();
    this.cdr.detectChanges();
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
      error: () => this.checkPatientSession()
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
      error: () => this.completeLogout()
    });
  }

  private completeLogout(): void {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private fetchPatientId(): void {
    this.dataService.getPatientId().subscribe({
      next: (response) => {
        if (response && response.Pid) {
          this.pid = response.Pid;
        }
      },
      error: () => {
        this.pid = null;
      }
    });
  }

  private fetchPatientImage(): void {
    this.dataService.getPatientImage().subscribe({
      next: (res) => {
        if (res && res.Image) {
          this.user.Image = 'assets/' + res.Image;
        }
      },
      error: (err) => {
        console.error('Error fetching user image:', err);
      }
    });
  }

  private fetchAppointmentNotification(): void {
    this.dataService.checkAppointmentTime().subscribe({
      next: (response) => {
        if (response && response.appointments && response.appointments.length > 0) {
          this.appointmentCount = response.appointments.length;
          this.appointmentInfo = response.appointments[0].RemainingTime || 'Upcoming appointment';
        }
      },
      error: (err) => {
        console.warn('No appointments or error:', err);
      }
    });
  }

  goToPatientDashboard(): void {
    if (this.pid) {
      this.router.navigate(['patient-dashboard']);
    }
  }

  onMouseEnter(): void {
    this.showTooltip = true;
  }

  onMouseLeave(): void {
    this.showTooltip = false;
  }
}
