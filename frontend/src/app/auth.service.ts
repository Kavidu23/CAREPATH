import { Injectable } from '@angular/core';
import { DataService } from './data.service'; // adjust the path as needed
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private dataService: DataService, private router: Router) {}

  // Check if a session exists
  checkSession(): Observable<boolean> {
    return this.dataService.checkPatientSession().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Store the redirect URL
  storeRedirectUrl() {
    const currentUrl = window.location.pathname; // Get current page URL
    localStorage.setItem('redirectUrl', currentUrl); // Store the URL in localStorage
  }

  // Get the stored redirect URL
  getRedirectUrl(): string {
    return localStorage.getItem('redirectUrl') || '/patient-dashboard'; // Default if no redirect URL
  }

  // Handle redirection after login
  onLoginSuccess() {
    const redirectUrl = this.getRedirectUrl(); // Use the getRedirectUrl method
    this.router.navigate([redirectUrl]); // Redirect to stored URL or default
    localStorage.removeItem('redirectUrl'); // Clear stored URL after redirection
  }
}
