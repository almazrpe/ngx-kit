import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DPSComponent } from "./dps.component";

describe("DpsComponent", () => {
  let component: DPSComponent;
  let fixture: ComponentFixture<DPSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DPSComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DPSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
