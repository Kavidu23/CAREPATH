import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetDoctorPasswordComponent } from './reset-doctor-password.component';

describe('ResetDoctorPasswordComponent', () => {
  let component: ResetDoctorPasswordComponent;
  let fixture: ComponentFixture<ResetDoctorPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetDoctorPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResetDoctorPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
