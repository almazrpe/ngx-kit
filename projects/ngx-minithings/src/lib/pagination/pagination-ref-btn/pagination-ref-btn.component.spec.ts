import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationRefBtnComponent } from './pagination-ref-btn.component';

describe('PaginationRefBtnComponent', () => {
  let component: PaginationRefBtnComponent;
  let fixture: ComponentFixture<PaginationRefBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaginationRefBtnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationRefBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
