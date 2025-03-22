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

export const routes: Routes = [
  {path: 'home', component: HomeComponent },  // Route for Home
  {path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect empty path to Home
  {path: 'doctor-dashboard', component: DDashboardComponent},
  {path: 'patient-dashboard', component: PDashboardComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'doctor-list', component: DlistComponent},
  {path: 'doctor-profile', component: DprofileComponent},
  {path: 'patient-profile', component: PprofileComponent},
  {path: 'change-password', component: ChangepComponent},
  {path: 'hospital', component: HospitalComponent},
  {path: 'supplier', component: SupplierComponent},
  {path: 'homecare', component: HomecareComponent},
  {path: 'blog', component: BlogComponent},
  {path: 'company', component: CompanyComponent},
  {path: 'book-confirm', component: BooksComponent},
  {path: 'book-now', component: BooknowComponent},
  {path: 'feedback', component: FeedbackComponent},
  { path: '**', redirectTo: '/home' } // Wildcard route (handles unknown routes)
];
