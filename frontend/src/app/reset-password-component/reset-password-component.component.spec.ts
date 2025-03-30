import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponentComponent } from './reset-password-component.component';

describe('ResetPasswordComponentComponent', () => {
  let component: ResetPasswordComponentComponent;
  let fixture: ComponentFixture<ResetPasswordComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResetPasswordComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
