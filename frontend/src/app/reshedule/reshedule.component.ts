import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-reshedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reshedule.component.html',
  styleUrls: ['./reshedule.component.css'],
})
export class ResheduleComponent implements OnInit, OnDestroy {
  appointmentId: string | null = null;
  doctorId: string | null = null;
  doctorProfile: any = null;
  availableDays: string[] = [];
  filteredDays: any[] = [];
  timeRange: string = '';
  selectedDay: string = '';
  isNextWeek: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');

    if (this.appointmentId) {
      this.dataService.getAppointmentById(this.appointmentId).subscribe({
        next: (appointment) => {
          this.doctorId = appointment.Did;
          if (this.doctorId) {
            this.getDoctorProfileById(this.doctorId);
          }
        },
        error: (err) => {
          console.error('Error fetching appointment:', err);
          alert('Failed to load appointment details.');
        },
      });
    }
  }

  ngOnDestroy(): void {}

  getDoctorProfileById(doctorId: string) {
    this.dataService.getDoctorByID(doctorId).subscribe({
      next: (data: any) => {
        this.doctorProfile = data;
        this.generateAvailableDaysAndTimeRange(data?.Availability || '');
        this.filterDaysForCurrentWeek();
      },
      error: (err) => {
        console.error('Error fetching doctor profile:', err);
        alert('Failed to load doctor availability.');
      },
    });
  }

  generateAvailableDaysAndTimeRange(availability: string) {
    const [daysPart, timePart] = availability.split(' ');
    const allDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (daysPart.includes('-')) {
      const [startDay, endDay] = daysPart.split('-');
      const startIndex = allDays.indexOf(startDay);
      const endIndex = allDays.indexOf(endDay);

      if (startIndex >= 0 && endIndex >= 0 && startIndex <= endIndex) {
        this.availableDays = allDays.slice(startIndex, endIndex + 1);
      } else {
        console.warn('Invalid day range:', daysPart);
        this.availableDays = [];
      }
    } else {
      this.availableDays = [daysPart];
    }

    this.timeRange = timePart || '';
  }

  getDateForDay(day: string, referenceDate: Date = new Date()): Date {
    const daysOfWeek: { [key: string]: number } = {
      sun: 0, sunday: 0,
      mon: 1, monday: 1,
      tue: 2, tuesday: 2,
      wed: 3, wednesday: 3,
      thu: 4, thursday: 4,
      fri: 5, friday: 5,
      sat: 6, saturday: 6,
    };

    const normalizedDay = day.toLowerCase().trim();
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);

    const targetDayIndex = daysOfWeek[normalizedDay];
    if (targetDayIndex === undefined) {
      console.error(`Invalid day: ${day}`);
      return new Date(NaN);
    }

    const todayDayIndex = today.getDay();
    const dayOffset = (targetDayIndex - todayDayIndex + 7) % 7;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    return targetDate;
  }

  filterDaysForCurrentWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.filteredDays = this.availableDays
      .map((day) => {
        const dayDate = this.getDateForDay(day, today);
        return isNaN(dayDate.getTime()) ? null : {
          day,
          date: dayDate,
          fullDate: formatDate(dayDate, 'fullDate', 'en-US'),
          formattedDate: formatDate(dayDate, 'yyyy-MM-dd', 'en-US'),
        };
      })
      .filter((item) => item && item.date >= startOfWeek && item.date <= endOfWeek);

    if (this.filteredDays.length === 0) {
      const nextWeekStart = new Date(startOfWeek);
      nextWeekStart.setDate(startOfWeek.getDate() + 7);

      this.filteredDays = this.availableDays
        .map((day) => {
          const dayDate = this.getDateForDay(day, nextWeekStart);
          return isNaN(dayDate.getTime()) ? null : {
            day,
            date: dayDate,
            fullDate: formatDate(dayDate, 'fullDate', 'en-US'),
            formattedDate: formatDate(dayDate, 'yyyy-MM-dd', 'en-US'),
          };
        })
        .filter((item) => item !== null);

      this.isNextWeek = true;
    } else {
      this.isNextWeek = false;
    }
  }

  submitReschedule(): void {
    if (this.selectedDay && this.timeRange) {
      const selected = this.filteredDays.find(day => day.formattedDate === this.selectedDay);
      const formattedDate = selected?.formattedDate || this.selectedDay;

      if (this.appointmentId) {
        this.dataService.resheduleAppointment(this.appointmentId, formattedDate, this.timeRange).subscribe({
          next: () => {
            alert(`Appointment rescheduled to ${formattedDate} at ${this.timeRange}`);
            this.router.navigate(['/appointments']);
          },
          error: (err) => {
            console.error('Error rescheduling appointment:', err);
            alert('Failed to reschedule appointment. Please try again.');
          },
        });
      } else {
        alert('Appointment ID is missing.');
      }
    } else {
      alert('Please select a date.');
    }
  }

  cancel(): void {
    this.router.navigate(['/patient-dashboard']);
  }
}
