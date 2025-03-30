import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailpasswordComponent } from './emailpassword.component';

describe('EmailpasswordComponent', () => {
  let component: EmailpasswordComponent;
  let fixture: ComponentFixture<EmailpasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailpasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
