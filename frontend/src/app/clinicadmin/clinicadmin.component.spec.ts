import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicadminComponent } from './clinicadmin.component';

describe('ClinicadminComponent', () => {
  let component: ClinicadminComponent;
  let fixture: ComponentFixture<ClinicadminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicadminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClinicadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
