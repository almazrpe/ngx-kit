import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImgViewerComponent } from "./img-viewer.component";

describe("ImgViewerComponent", () => {
  let component: ImgViewerComponent;
  let fixture: ComponentFixture<ImgViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImgViewerComponent]
    });
    fixture = TestBed.createComponent(ImgViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
