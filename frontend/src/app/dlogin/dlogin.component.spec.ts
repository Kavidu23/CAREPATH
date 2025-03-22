import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DloginComponent } from './dlogin.component';

describe('DloginComponent', () => {
  let component: DloginComponent;
  let fixture: ComponentFixture<DloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DloginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
