import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomecareComponent } from './homecare.component';

describe('HomecareComponent', () => {
  let component: HomecareComponent;
  let fixture: ComponentFixture<HomecareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomecareComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomecareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
