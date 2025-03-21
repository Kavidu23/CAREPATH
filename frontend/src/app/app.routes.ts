import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Import the Home component

export const routes: Routes = [
  { path: 'home', component: HomeComponent },  // Route for Home
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect empty path to Home
  { path: '**', redirectTo: '/home' } // Wildcard route (handles unknown routes)
];
