import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = 'http://localhost:3000/'; // Base URL for your API

  constructor(private http: HttpClient) {}

  // Fetch doctor counts by specialization
  getDoctorCounts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}home/doctor-counts`); // API endpoint for doctor counts
  }

  // Fetch newly registered doctors
  getNewlyRegisteredDoctors(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}home/newly-registered`); // API endpoint for newly registered doctors
  }

  // Fetch testimonials
  getTestimonials(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}home/feedback`);
  }

  // Search doctors based on type, date, and location
  searchDoctors(params: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.location) httpParams = httpParams.set('location', params.location);

    return this.http.get<any[]>(`${this.baseUrl}home/search`, { params: httpParams });
  }

  // Signup API call
  signUp(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}patient/signup`, userData); // API endpoint for signup
  }

  // Login API call
  login(email: string, password: string): Observable<any> {
    const loginData = { Email: email, Password: password };
    return this.http.post<any>(`${this.baseUrl}patient/login`, loginData); // API endpoint for login
  }


  // Fetch doctor profile
  getDoctorProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}doctor/profile`); // API endpoint for doctor profile
  }

  // Fetch upcoming appointments
  getUpcomingAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/appointments`); // API endpoint for upcoming appointments
  }

  // Fetch clinics availability
  getClinicsAvailability(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/clinics`); // API endpoint for clinics availability
  }

  // Fetch bank details
  getBankDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/bank-details`); // API endpoint for bank details
  }

  // Fetch appointment data
  getAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/appointments`); // API endpoint for appointments
  }

  // Fetch medical records data
  getMedicalRecords(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/medical-records`); // API endpoint for medical records
  }

  // Fetch prescriptions data
  getPrescriptions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/prescriptions`); // API endpoint for prescriptions
  }

  // Fetch invoices data
  getInvoices(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/invoices`); // API endpoint for invoices
  }

  // Add the signUpDoctor method to handle doctor registration
  signUpDoctor(formData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}doctor/signup`, formData);
  }

  //Doctor patinet
  doctorlogin(email: string, password: string): Observable<any> {
    const loginData = { Email: email, Password: password };
    return this.http.post<any>(`${this.baseUrl}doctor/login`, loginData); // API endpoint for login
  }

}
