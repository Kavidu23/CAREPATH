import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const doctorAuthGuard: CanActivateFn = (route, state) => {  // ✅ Ensure 'export' is included
  const router = inject(Router);
  const dataService = inject(DataService);

  return dataService.checkDoctorSession().pipe(
    map((doctorResponse) => {
      if (doctorResponse === true) {
        return true; // Doctor session is valid, allow navigation
      } else {
        router.navigate(['/home']); // Redirect if no doctor session
        return false; // Block navigation
      }
    }),
    catchError(() => {
      router.navigate(['/home']);
      return [false]; // Redirect in case of error
    })
  );
};
