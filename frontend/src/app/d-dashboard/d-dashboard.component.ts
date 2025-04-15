import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewheaderComponent } from '../newheader/newheader.component';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HeadercheckComponent } from "../headercheck/headercheck.component";
import { retryWhen, scan, delay } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-d-dashboard',
  standalone: true,
  imports: [CommonModule, NewheaderComponent, HeadercheckComponent],
  templateUrl: './d-dashboard.component.html',
  styleUrls: ['./d-dashboard.component.css']
})
export class DDashboardComponent implements OnInit, OnDestroy {
  doctorProfile = {
    Did: undefined as number | undefined,
    Fname: '',
    Lname: '',
    Image: '',
    Specialization: ''
  };

  upcomingAppointments: { Aid?: string; Fname: string; Lname: string; Date: string; Time: string; Type: string; Link?: string }[] = [];
  clinicsAvailability: { Name: string; Location: string; fee?: string; availability?: { day: string; time: string }[] }[] = [];
  appointments: { Aid?: string; Fname: string; Lname: string; Date: string; Type: string; status?: string; Link?: string }[] = [];
  prescriptions: { Rid?: string; Fname: string; Lname: string; Duration: string; Frequency: string }[] = [];
  invoices: { id?: string; patientPic?: string; patientName: string; date: string; amount: string; status?: string }[] = [];
  newClinics: { Name: string; Location: string; Pnumber: String; Cid: string; }[] = [];
  totalPatients: number = 0; // Stores today's patient count

  private isLoading = false;
  private subscription = new Subscription();

  constructor(private dataService: DataService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.isLoading) {
      console.log('Data loading already in progress. Skipping ngOnInit.');
      return;
    }

    this.isLoading = true;
    console.log('Fetching dashboard data...');

    // Fetching all the data at once
    this.fetchDashboardData();
  }

  private fetchDashboardData(): void {
    this.subscription.add(
      this.dataService.getDoctorProfile().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.doctorProfile = { ...this.doctorProfile, ...data };
          console.log('Doctor Profile:', this.doctorProfile);
        }),
        catchError((err) => {
          console.error('Failed to fetch doctor profile:', err);
          return of({});
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getUpcomingAppointments().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.upcomingAppointments = data || [];
          console.log('Upcoming Appointments:', this.upcomingAppointments);
        }),
        catchError((err) => {
          console.error('Failed to fetch upcoming appointments:', err);
          return of([]);
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getClinicsAvailability().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.clinicsAvailability = data || [];
          console.log('Clinics Availability:', this.clinicsAvailability);
        }),
        catchError((err) => {
          console.error('Failed to fetch clinics availability:', err);
          return of([]);
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getAppointments().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.appointments = data || [];
          console.log('Appointments:', this.appointments);
        }),
        catchError((err) => {
          console.error('Failed to fetch appointments:', err);
          return of([]);
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getPrescriptions().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.prescriptions = data || [];
          console.log('Prescriptions:', this.prescriptions);
        }),
        catchError((err) => {
          console.error('Failed to fetch prescriptions:', err);
          return of([]);
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getInvoices().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.invoices = data || [];
          console.log('Invoices:', this.invoices);
        }),
        catchError((err) => {
          console.error('Failed to fetch invoices:', err);
          return of([]);
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getTodayPatients().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.totalPatients = data?.total_patients ?? 0;
          console.log('Total Patients:', this.totalPatients);
        }),
        catchError((err) => {
          console.error('Failed to fetch today\'s patients:', err);
          return of({ total_patients: 0 });
        })
      ).subscribe()
    );

    this.subscription.add(
      this.dataService.getNewClinicsDetails().pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3 || error.status !== 429) {
                throw error;
              }
              console.warn(`Retrying API request... Attempt ${retryCount + 1}`);
              return retryCount + 1;
            }, 0),
            delay(5000)
          )
        ),
        tap((data) => {
          this.newClinics = data || [];
          console.log('Updated newClinics:', this.newClinics);
        }),
        catchError((err) => {
          console.error('Failed to fetch clinics:', err);
          return of([]);
        })
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('Component destroyed, subscriptions cleaned up');
  }

  //Join appointment function
  joinAppointment(appointmentId: string): void {
    // Find the appointment by its ID
    const appointment = this.upcomingAppointments.find(app => app.Aid === appointmentId);

    if (!appointment) {
      alert('Appointment not found.');
      return;
    }

    if (!appointment.Link) {
      alert('No meeting link available for this appointment.');
      return;
    }

    const confirmJoin = confirm('Are you sure you want to join the appointment?');
    if (confirmJoin) {
      // Open the meeting link in a new tab
      window.open(appointment.Link, '_blank');
    }
  }

  canJoinNow(appointment: any): boolean {
    if (!appointment?.Date || !appointment?.Time) return false;
  
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.Date}T${appointment.Time}`);
  
    const tenMinutesBefore = new Date(appointmentDateTime.getTime() - 10 * 60000);
    const oneHourAfter = new Date(appointmentDateTime.getTime() + 60 * 60000);
  
    return now >= tenMinutesBefore && now <= oneHourAfter;
  }
  
  

}
