import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewheaderComponent } from './newheader.component';

describe('NewheaderComponent', () => {
  let component: NewheaderComponent;
  let fixture: ComponentFixture<NewheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewheaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
