import { Injectable } from '@angular/core';
import { DataService } from './data.service'; // adjust the path as needed
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private dataService: DataService) {}

  checkSession(): Observable<boolean> {
    return this.dataService.checkPatientSession().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
