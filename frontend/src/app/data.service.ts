import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = 'http://localhost:3000/'; // Base URL for your API

  constructor(private http: HttpClient) { }

  // Method to check if the doctor is logged in
  checkSession(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}doctor/session`, { withCredentials: true }); // withCredentials for session
  }

  // Fetch doctor profile
  getDoctorProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/profile`, { withCredentials: true });
  }

  // Fetch upcoming appointments doctor
  getUpcomingAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/upcoming-appointments`, { withCredentials: true });
  }

  // Fetch clinics availability
  getClinicsAvailability(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/clinics`, { withCredentials: true });
  }

  //Fetch new clicnic
  getNewClinicsDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/newClinics`, { withCredentials: true });
  }

  // Fetch bank details
  getBankDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/bank-details`, { withCredentials: true });
  }

  // Fetch appointment data
  getAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/appointments`, { withCredentials: true });
  }

  // Fetch medical records data
  getMedicalRecords(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/medical-records`, { withCredentials: true });
  }

  // Fetch prescriptions data
  getPrescriptions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/prescriptions`, { withCredentials: true });
  }

  // Fetch invoices data
  getInvoices(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_profile/invoices`, { withCredentials: true });
  }

  // Fetch doctor counts by specialization
  getDoctorCounts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}home/doctor-counts`, { withCredentials: true }); // API endpoint for doctor counts
  }

  // Fetch newly registered doctors
  getNewlyRegisteredDoctors(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}home/newly-registered`); // API endpoint for newly registered doctors
  }

  //Fetch today patinets
  getTodayPatients(): Observable<{ total_patients: number }> {
    console.log('Fetching today’s patient count...');
    return this.http.get<{ total_patients: number }>(`${this.baseUrl}d_profile/today_patients`, { withCredentials: true });
  }


  // Fetch testimonials
  getTestimonials(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}home/feedback`); // API endpoint for testimonials
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
    return this.http.post<any>(`${this.baseUrl}patient/login`, loginData, { withCredentials: true }); // API endpoint for login
  }

  doctorLogout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}doctor/logout`, {}, { withCredentials: true });
  }

  patientLogout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}patient/logout`, {}, { withCredentials: true });
  }

  // Check if the current session belongs to a doctor
  checkDoctorSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}doctor/session-doctor`, { withCredentials: true });
  }

  // Check if the current session belongs to a patient
  checkPatientSession(): Observable<any> {
    return this.http.get(`${this.baseUrl}patient/session-patient`, { withCredentials: true });
  }


  // Add the signUpDoctor method to handle doctor registration
  signUpDoctor(formData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}doctor/signup`, formData); // API endpoint for doctor registration
  }

  doctorLogin(email: string, password: string): Observable<any> {
    const loginData = { Email: email, Password: password };
    return this.http.post<any>(`${this.baseUrl}doctor/login`, loginData, { withCredentials: true }); // API endpoint for doctor login
  }

  // Fetch patient profile
  getPatientProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}p_profile/profile`, { withCredentials: true });
  }

  // Fetch upcoming appointments patient
  getPatientUpcomingAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}p_profile/upcoming`, { withCredentials: true });
  }

  // Cancel an appointment
  cancelAppointment(Aid: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}p_profile/appointments/cancel/${Aid}`, { withCredentials: true });
  }

  // Fetch past appointments
  getPastAppointments(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}p_profile/appointments/past`, { withCredentials: true });
  }

  // Reschedule an appointment
  rescheduleAppointment(Aid: string, newDate: string, newTime: string): Observable<any> {
    const body = { newDate, newTime };
    return this.http.put<any>(`${this.baseUrl}p_profile/appointments/reschedule/${Aid}`, body, { withCredentials: true });
  }

  // Fetch reports (Appointments, Medical Records, Prescriptions, Invoices)
  getReports(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}p_profile/reports`, { withCredentials: true });
  }

  // API call to check if the user session exists
  getUserSession(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}session/check-user-session`, { withCredentials: true });
  }

  // API call to check if the doctor session exists
  getDoctorSession(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}session/check-doctor-session`, { withCredentials: true });
  }

  // Fetch prescriptions from patient
  getPatientPrescriptions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}p_profile/prescription`, { withCredentials: true });
  }

  //get patent invoice
  getPatientInvoice(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}p_profile/invoice`, { withCredentials: true });
  }

  //update patient
  updatePatientEmail(formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}patient/updateEmail`, formData, { withCredentials: true });
  }

  //delete patient account
  deletePatientAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}patient/delete`, { withCredentials: true });
  }

  //change patient passowrd
  changePassword(oldpassword: string, newpassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}patient/changepassword`, {
      oldpassword,
      newpassword
    }, { withCredentials: true });
  }

  //reset password
  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}patient/resetpassword`, { email, token, newPassword }, { withCredentials: true });
  }

  //patient forgot password
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}patient/forgotpassword`, { Email: email });
  }

  //patient feedback
  submitFeedback(feedback: any): Observable<any> {
    return this.http.post(`${this.baseUrl}patient/feedback`, feedback, { withCredentials: true });
  }


  getDoctors(filters: any): Observable<any> {
    let params = new HttpParams();

    // Add filters to the URL params
    if (filters.specialization) params = params.set('specialization', filters.specialization);
    if (filters.gender) params = params.set('gender', filters.gender);
    if (filters.availability) params = params.set('availability', filters.availability);

    return this.http.post<any>(`${this.baseUrl}d_list`, { params });
  }


  // Get doctor details by ID
  getDoctorById(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}d_list/:Did${doctorId}`, { withCredentials: true });
  }


  getDoctorsFiltered(filters: string) {
    return this.http.get<any[]>(`${this.baseUrl}d_list/filter?${filters}`, { withCredentials: true });
  }

  // Fetch doctor details by ID
  getDoctorByID(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}doctor/${doctorId}`, { withCredentials: true });

  }

  getPaymentStatus(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}payment/create-checkout-session`,
      {}, // body
      { withCredentials: true } // options
    );
  }


  getPayment(bookingData: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}payment/bookings`,
      bookingData,
      { withCredentials: true }
    );
  }

  //doctor reset password
  doctorResetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}doctor/reset-password`, { Email: email }, { withCredentials: true });
  }

  // Change password for doctor
  doctorChangePassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}doctor/change-password`, {
      email,
      token,
      newPassword
    });
  }


  // Book an appointment
  bookAppointment(appointmentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}patient/book-appointment`, appointmentData, { withCredentials: true });
  }
  



}
