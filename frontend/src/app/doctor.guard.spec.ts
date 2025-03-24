import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { doctorGuard } from './doctor.guard';

describe('doctorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => doctorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
