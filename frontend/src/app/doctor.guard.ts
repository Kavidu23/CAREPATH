import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const doctorAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dataService = inject(DataService);

  return dataService.checkDoctorSession().pipe(
    map((doctorResponse) => {
      if (doctorResponse === true) {
        return true; // Doctor session is valid, allow navigation
      } else {
        router.navigate(['/home']); // Redirect to login if no doctor session
        return false; // Block navigation
      }
    }),
    catchError(() => {
      router.navigate(['/home']);
      return [false]; // Redirect to login in case of error
    })
  );
};
