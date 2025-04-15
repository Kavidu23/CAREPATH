import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResheduleComponent } from './reshedule.component';

describe('ResheduleComponent', () => {
  let component: ResheduleComponent;
  let fixture: ComponentFixture<ResheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResheduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
