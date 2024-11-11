import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinchZoomComponent } from './pinch-zoom.component';

describe('PinchZoomComponent', () => {
  let component: PinchZoomComponent;
  let fixture: ComponentFixture<PinchZoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PinchZoomComponent]
    });
    fixture = TestBed.createComponent(PinchZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
