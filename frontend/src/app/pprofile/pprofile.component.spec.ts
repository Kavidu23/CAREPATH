import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PprofileComponent } from './pprofile.component';

describe('PprofileComponent', () => {
  let component: PprofileComponent;
  let fixture: ComponentFixture<PprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PprofileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
