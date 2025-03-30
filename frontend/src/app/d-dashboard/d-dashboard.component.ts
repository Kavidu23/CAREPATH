import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewheaderComponent } from '../newheader/newheader.component';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { catchError, delay, concatMap, retryWhen, tap, take } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { HeadercheckComponent } from "../headercheck/headercheck.component";

interface TodayPatientsResponse {
  total_patients: number;  // Updated to reflect the backend response
}

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

  upcomingAppointments: { Fname: string; Lname: string; Date: string; Time: string }[] = [];
  clinicsAvailability: { Name: string; Location: string; fee?: string; availability?: { day: string; time: string }[] }[] = [];
  appointments: { Aid?: string; Fname: string; Lname: string; Date: string; type: string; status?: string }[] = [];
  prescriptions: { Rid?: string; Fname: string; Lname: string; Duration: string; Frequency: string }[] = [];
  invoices: { id?: string; patientPic?: string; patientName: string; date: string; amount: string; status?: string }[] = [];
  todayPatients: number = 0; // To store today's patient count

  private isLoading = false;
  private subscription = new Subscription();

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    if (this.isLoading) {
      console.log('Data loading already in progress. Skipping ngOnInit.');
      return;
    }

    this.isLoading = true;
    console.log('Fetching dashboard data...');

    const apiCalls = [
      { fetch: this.dataService.getDoctorProfile(), target: 'doctorProfile', isArray: false },
      { fetch: this.dataService.getUpcomingAppointments(), target: 'upcomingAppointments', isArray: true },
      { fetch: this.dataService.getClinicsAvailability(), target: 'clinicsAvailability', isArray: true },
      { fetch: this.dataService.getAppointments(), target: 'appointments', isArray: true },
      { fetch: this.dataService.getPrescriptions(), target: 'prescriptions', isArray: true },
      { fetch: this.dataService.getInvoices(), target: 'invoices', isArray: true },
      { fetch: this.dataService.getTodayPatients(), target: 'todayPatients', isArray: false } // New API call for todayPatients
    ];

    let requests = of(null);
    apiCalls.forEach((call, index) => {
      requests = requests.pipe(
        concatMap(() =>
          call.fetch.pipe(
            tap(() => console.log(`Fetching ${call.target} (Request ${index + 1}/${apiCalls.length})`)),
            delay(20),
            retryWhen(errors =>
              errors.pipe(
                tap(err => console.warn(`Retrying ${call.target} due to:`, err)),
                delay(30),
                take(2)
              )
            ),
            catchError(err => {
              console.error(`Failed to fetch ${call.target}:`, err.status, err.statusText);
              return of(call.isArray ? [] : {});
            })
          )
        ),
        concatMap(data => {
          this.mapFetchedData(call.target, data);
          return of(null);
        })
      );
    });

    this.subscription.add(requests.subscribe({
      complete: () => {
        console.log('All data fetched successfully:', {
          doctorProfile: this.doctorProfile,
          upcomingAppointments: this.upcomingAppointments,
          clinicsAvailability: this.clinicsAvailability,
          appointments: this.appointments,
          prescriptions: this.prescriptions,
          invoices: this.invoices,
          todayPatients: this.todayPatients // Log the fetched todayPatients count
        });
        this.isLoading = false;
      },
      error: (err) => console.error('Request sequence failed:', err)
    }));
  }

  private mapFetchedData(target: string, data: any) {
    console.log(`Mapping data for ${target}:`, data); // Log data for debugging

    switch (target) {
      case 'doctorProfile':
        this.doctorProfile = { ...this.doctorProfile, ...data };
        break;
      case 'todayPatients':
        // Since the backend returns { total_patients: 1 }, we need to map it correctly
        this.todayPatients = data?.total_patients || 0; // Adjust according to backend response
        break;  
      case 'upcomingAppointments':
        this.upcomingAppointments = (data as any[]).map(appt => ({
          Fname: appt.Fname || 'N/A',
          Lname: appt.Lname || 'N/A',
          Date: appt.Date || 'N/A',
          Time: appt.Time || 'N/A'
        }));
        break;
      case 'clinicsAvailability':
        this.clinicsAvailability = (data as any[]).map(clinic => ({
          Name: clinic.Name || 'N/A',
          Location: clinic.Location || 'N/A',
          fee: clinic.fee || 'N/A',
          availability: clinic.availability || []
        }));
        break;
      case 'appointments':
        this.appointments = (data as any[]).map(appt => ({
          Aid: appt.Aid?.toString() || 'Unknown',
          Fname: appt.Fname || 'N/A',
          Lname: appt.Lname || 'N/A',
          Date: appt.Date || 'N/A',
          type: appt.Type || 'General',
          status: appt.Status || 'AWAITING'
        }));
        break;
      case 'prescriptions':
        this.prescriptions = (data as any[]).map(pres => ({
          Rid: pres.Rid?.toString() || 'Unknown',
          Fname: pres.Fname || 'N/A',
          Lname: pres.Lname || 'N/A',
          Duration: pres.Duration || 'N/A',
          Frequency: pres.Frequency || 'N/A'
        }));
        break;
      case 'invoices':
        this.invoices = (data as any[]).map(inv => ({
          id: inv.id?.toString() || 'Unknown',
          patientName: `${inv.Fname || 'N/A'} ${inv.Lname || 'N/A'}`,
          date: inv.date || 'N/A',
          amount: inv.amount || 'N/A',
          status: inv.status || 'Pending'
        }));
        break;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    console.log('Component destroyed, subscriptions cleaned up');
  }
}
