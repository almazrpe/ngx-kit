import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSliderComponent } from './mat-slider.component';

describe('MatSliderComponent', () => {
  let component: MatSliderComponent;
  let fixture: ComponentFixture<MatSliderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatSliderComponent]
    });
    fixture = TestBed.createComponent(MatSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
