import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DregistrationComponent } from './dregistration.component';

describe('DregistrationComponent', () => {
  let component: DregistrationComponent;
  let fixture: ComponentFixture<DregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DregistrationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
