import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const patientAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const dataService = inject(DataService);

  return dataService.checkPatientSession().pipe(
    map((userResponse) => {
      if (userResponse === true) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false); // ✅ FIXED: use `of(false)` instead of `[false]`
    })
  );
};
