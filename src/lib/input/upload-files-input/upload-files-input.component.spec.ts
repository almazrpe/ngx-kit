import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadFilesInputComponent } from "./upload-files-input.component";

describe("UploadFilesInputComponent", () => {
  let component: UploadFilesInputComponent;
  let fixture: ComponentFixture<UploadFilesInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadFilesInputComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UploadFilesInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
