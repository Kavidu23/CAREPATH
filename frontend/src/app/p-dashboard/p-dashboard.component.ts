import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewheaderComponent } from '../newheader/newheader.component';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { catchError, delay, concatMap, retryWhen, tap, take } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { FooterComponent } from "../footer/footer.component";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-p-dashboard',
  standalone: true,
  imports: [CommonModule, NewheaderComponent, FooterComponent, HeaderComponent],
  templateUrl: './p-dashboard.component.html',
  styleUrls: ['./p-dashboard.component.css']
})
export class PDashboardComponent implements OnInit, OnDestroy {
  patientProfile = {
    patientId: undefined as number | undefined,
    firstName: '',
    lastName: '',
    image: '',
    gender: '',
    age: ''
  };

  upcomingAppointments: { id: string; doctorName: string; date: string; time: string; specialty?: string; location?: string; clinicName?: string; type?: string; }[] = [];
  pastAppointments: { id: string; doctorName: string; date: string; time: string; duration?: string; specialty?: string; location?: string; clinicName?: string; type?: string; }[] = [];
  prescriptions: { id: string; frequency: string; description: string; doctor: string; }[] = [];
  invoices: { id: string; Fname: string; Date: string; Amount: string; Status: string }[] = [];

  private isLoading = false;
  private subscription = new Subscription();

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    console.log('Patient dashboard initialized. Fetching data...');
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    if (this.isLoading) {
      console.log('Data loading already in progress. Skipping.');
      return;
    }

    this.isLoading = true;
    console.log('Fetching patient dashboard data...');

    const apiCalls = [
      { fetch: this.dataService.getPatientProfile(), target: 'patientProfile', isArray: false },
      { fetch: this.dataService.getPatientUpcomingAppointments(), target: 'upcomingAppointments', isArray: true },
      { fetch: this.dataService.getPastAppointments(), target: 'pastAppointments', isArray: true },
      { fetch: this.dataService.getPatientPrescriptions(), target: 'prescriptions', isArray: true },
      { fetch: this.dataService.getPatientInvoice(), target: 'invoices', isArray: true }
    ];

    let requests = of(null);
    apiCalls.forEach((call) => {
      requests = requests.pipe(
        concatMap(() =>
          call.fetch.pipe(
            tap((data) => console.log(`Raw response for ${call.target}:`, data)),
            delay(20), // Remove in production if not needed
            retryWhen((errors) =>
              errors.pipe(
                tap((err) => console.warn(`Retrying ${call.target} due to:`, err)),
                delay(30),
                take(2)
              )
            ),
            catchError((err) => {
              console.error(`Failed to fetch ${call.target}:`, err);
              return of(call.isArray ? [] : {});
            })
          )
        ),
        concatMap((data) => {
          this.mapFetchedData(call.target, data);
          console.log(`Mapped ${call.target}:`, (this as any)[call.target]);
          return of(null);
        })
      );
    });

    this.subscription.add(
      requests.subscribe({
        complete: () => {
          console.log('All patient data fetched successfully:', {
            patientProfile: this.patientProfile,
            upcomingAppointments: this.upcomingAppointments,
            pastAppointments: this.pastAppointments,
            prescriptions: this.prescriptions,
            invoices: this.invoices,
          });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Request sequence failed:', err);
          this.isLoading = false;
        },
      })
    );
  }

  private mapFetchedData(target: string, data: any) {
    console.log(`Mapping data for ${target}:`, data);

    // Handle nested user object if present
    const profileData = data?.user || data; // Use nested user if exists, else use data directly

    switch (target) {
      case 'patientProfile':
        this.patientProfile = {
          patientId: profileData.Pid || profileData.pid || profileData.id || undefined,
          firstName: profileData.Fname || profileData.firstName || 'N/A',
          lastName: profileData.Lname || profileData.lastName || 'N/A',
          image: profileData.Image || profileData.image || '',
          gender: profileData.Gender || profileData.gender || 'N/A',
          age: profileData.Age || profileData.age || 'N/A',
        };
        break;
        case 'upcomingAppointments':
        this.upcomingAppointments = (data || []).map((appt: any) => ({
        id: appt.Aid?.toString() || 'Unknown',
        doctorName: appt.DoctorName || 'N/A',
        date: appt.Date || 'N/A',
        time: appt.Time || 'N/A',
        specialty: appt.Specialization || 'N/A',
        type: appt.Type || 'N/A',
        clinicName: appt.ClinicName || 'N/A', // Added Clinic Name
        location: appt.ClinicLocation || 'N/A', // Added Clinic Location
        }));
     
        break;
        case 'pastAppointments':
          this.pastAppointments = (data || []).map((appt: any) => ({
              id: appt.Aid?.toString() || 'Unknown',
              doctorName: appt.DoctorName || 'N/A',
              date: appt.Date || 'N/A',
              time: appt.Time || 'N/A',
              specialty: appt.Specialization || 'N/A', // Fixed from Specialty to Specialization
              location: appt.ClinicLocation || 'N/A', // Fixed from Location to ClinicLocation
              clinicName: appt.ClinicName || 'N/A', // Added ClinicName
              type: appt.Type || 'N/A', // Added Type (Physical/Online)
          }));      
        break;
      case 'prescriptions':
        this.prescriptions = (data || []).map((pres: any) => ({
          id: pres.Rid?.toString() || pres.id?.toString() || 'Unknown',
          doctor: pres.Fname || pres.doctor || 'N/A',
          frequency: `${pres.Frequency || pres.frequency || 'N/A'} ${pres.DoctorLname || pres.Lname || 'N/A'}`,
          description: pres.Description || pres.description || 'N/A'
        }));
        break;
      case 'invoices':
          this.invoices = (data || []).map((inv: any) => ({
              id: inv.Pid?.toString() || 'Unknown',
              Name: `${inv.Fname || 'N/A'}`,
              Date: inv.IssuedDate || 'N/A',
              Amount: inv.FinalAmount || 'N/A',
              Status: inv.PaymentStatus || 'Pending',
          }));
          console.log(this.invoices);  // Debugging line to check the data
          break;
             
    }
  }

  cancelAppointment(id: string) {
    this.dataService.cancelAppointment(id).subscribe({
      next: () => {
        console.log(`Appointment with ID: ${id} canceled successfully`);
        this.upcomingAppointments = this.upcomingAppointments.filter((appt) => appt.id !== id);
      },
      error: (err) => console.error(`Failed to cancel appointment with ID: ${id}`, err),
    });
  }

  rescheduleAppointment(id: string) {
    const newDate = prompt('Enter new date (YYYY-MM-DD):') || '';
    const newTime = prompt('Enter new time (HH:MM AM/PM):') || '';
    if (newDate && newTime) {
      this.dataService.rescheduleAppointment(id, newDate, newTime).subscribe({
        next: () => {
          console.log(`Appointment with ID: ${id} rescheduled to ${newDate} ${newTime}`);
          this.loadDashboardData();
        },
        error: (err) => console.error(`Failed to reschedule appointment with ID: ${id}`, err),
      });
    }
  }

  bookNewAppointment() {
    console.log('Book new appointment clicked');
    this.router.navigate(['/book-appointment']);
  }

  viewPrescription(id: string) {
    console.log(`View prescription with ID: ${id}`);
    this.router.navigate(['/prescription', id]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('Component destroyed, subscriptions cleaned up');
  }

  confirmCancel(appointmentId: string) {
    const isConfirmed = window.confirm("Are you sure you want to cancel this appointment?");
    if (isConfirmed) {
      this.cancelAppointment(appointmentId);
    }
  }

  
  joinAppointment(appointmentId: string) {
    // Ask for confirmation to join the appointment
    const confirmJoin = confirm('Are you sure you want to join the appointment?');
    if (confirmJoin) {
      console.log(`Joining online appointment with ID: ${appointmentId}`);
      // You can redirect to a meeting link or perform any action
      // Example: window.location.href = 'https://example.com/meeting-link';
    }
  }
  
}
