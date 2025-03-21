import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DDashboardComponent } from './d-dashboard.component';

describe('DDashboardComponent', () => {
  let component: DDashboardComponent;
  let fixture: ComponentFixture<DDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
