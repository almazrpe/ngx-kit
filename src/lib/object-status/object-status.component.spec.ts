import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ObjectStatusComponent } from "./object-status.component";

describe("ObjectStatusComponent", () => {
  let component: ObjectStatusComponent;
  let fixture: ComponentFixture<ObjectStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectStatusComponent]
    });
    fixture = TestBed.createComponent(ObjectStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
