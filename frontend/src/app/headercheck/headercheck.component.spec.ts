import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadercheckComponent } from './headercheck.component';

describe('HeadercheckComponent', () => {
  let component: HeadercheckComponent;
  let fixture: ComponentFixture<HeadercheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadercheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeadercheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
