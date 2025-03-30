import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestPasswordResetComponentComponent } from './request-password-reset-component.component';

describe('RequestPasswordResetComponentComponent', () => {
  let component: RequestPasswordResetComponentComponent;
  let fixture: ComponentFixture<RequestPasswordResetComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestPasswordResetComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestPasswordResetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
