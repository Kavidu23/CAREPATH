import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { patientGuard } from './patient.guard';

describe('patientGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => patientGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
