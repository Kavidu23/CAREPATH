import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DlistComponent } from './dlist.component';

describe('DlistComponent', () => {
  let component: DlistComponent;
  let fixture: ComponentFixture<DlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
