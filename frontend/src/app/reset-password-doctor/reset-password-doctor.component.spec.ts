import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordDoctorComponent } from './reset-password-doctor.component';

describe('ResetPasswordDoctorComponent', () => {
  let component: ResetPasswordDoctorComponent;
  let fixture: ComponentFixture<ResetPasswordDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordDoctorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResetPasswordDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
