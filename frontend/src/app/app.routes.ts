import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Import the Home component
import { DDashboardComponent } from './d-dashboard/d-dashboard.component';
import { PDashboardComponent } from './p-dashboard/p-dashboard.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { DlistComponent } from './dlist/dlist.component';
import { DprofileComponent } from './dprofile/dprofile.component';
import { PprofileComponent } from './pprofile/pprofile.component';
import { ChangepComponent } from './changep/changep.component';
import { HospitalComponent } from './hospital/hospital.component';
import { SupplierComponent } from './supplier/supplier.component';
import { HomecareComponent } from './homecare/homecare.component';
import { BlogComponent } from './blog/blog.component';
import { CompanyComponent } from './company/company.component';
import { BooksComponent } from './books/books.component';
import { BooknowComponent } from './booknow/booknow.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { DregistrationComponent } from './dregistration/dregistration.component';
import { DloginComponent } from './dlogin/dlogin.component';
import { doctorAuthGuard } from './doctor.guard';
import { patientAuthGuard } from './patient.guard';
import { EmailpasswordComponent } from './emailpassword/emailpassword.component';
import { Component } from '@angular/core';
import { ResetPasswordComponent } from './reset-password-component/reset-password-component.component';
import { RequestPasswordResetComponent } from './request-password-reset-component/request-password-reset-component.component';
import { ResetPasswordDoctorComponent } from './reset-password-doctor/reset-password-doctor.component';
import { ResetPasswordComponentDoctor } from './reset-doctor-password/reset-doctor-password.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { ResheduleComponent } from './reshedule/reshedule.component';
import { ViewprofileComponent } from './viewprofile/viewprofile.component';
import { ClinicAdminComponent } from './clinicadmin/clinicadmin.component';
import { AdminloginComponent } from './adminlogin/adminlogin.component';
import { WebAdminComponent } from './webadmin/webadmin.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'; // ✅ Add RouterModule here


export const routes: Routes = [
  { path: 'home', component: HomeComponent },  // Route for Home
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect empty path to Home
  { path: 'doctor-dashboard', component: DDashboardComponent, canActivate: [doctorAuthGuard] },
  { path: 'patient-dashboard', component: PDashboardComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'doctor-list', component: DlistComponent },
  { path: 'doctor-profile', component: DprofileComponent, canActivate: [doctorAuthGuard] },
  { path: 'patient-profile', component: PprofileComponent, canActivate: [patientAuthGuard] },
  { path: 'change-password', component: ChangepComponent, canActivate: [patientAuthGuard] },
  { path: 'hospital', component: HospitalComponent },
  { path: 'supplier', component: SupplierComponent },
  { path: 'homecare', component: HomecareComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'company', component: CompanyComponent },
  { path: 'book-confirm', component: BooksComponent },
  { path: 'book-now', component: BooknowComponent },
  { path: 'feedback', component: FeedbackComponent, canActivate: [patientAuthGuard] },
  { path: 'doctor-registration', component: DregistrationComponent },
  { path: 'doctor-login', component: DloginComponent },
  { path: 'app-emailpassword', component: EmailpasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'request-reset', component: RequestPasswordResetComponent },
  { path: 'reset-password-doctor', component: ResetPasswordDoctorComponent },
  { path: 'reset-doctor-password', component: ResetPasswordComponentDoctor },
  { path: 'receipt', component: ReceiptComponent },
  { path: 'reshedule', component: ResheduleComponent },
  { path: 'view-now', component: ViewprofileComponent },
  { path: 'clinic-admin', component: ClinicAdminComponent },
  { path: 'admin-login', component: AdminloginComponent },
  { path: 'web-admin', component: WebAdminComponent },
  { path: '**', redirectTo: '/home' } // Wildcard route (handles unknown routes)
];


