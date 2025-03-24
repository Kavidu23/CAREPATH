import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const patientAuthGuard: CanActivateFn = (route, state) => {  // ✅ Ensure 'export' is included
  const router = inject(Router);
  const dataService = inject(DataService);

  return dataService.checkPatientSession().pipe(
    map((userResponse) => {
      if (userResponse === true) {
        return true; // Patient session is valid, allow navigation
      } else {
        router.navigate(['/login']); // Redirect to login if no patient session
        return false; // Block navigation
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return [false]; // Redirect to login in case of error
    })
  );
};
