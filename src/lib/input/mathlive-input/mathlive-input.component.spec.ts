import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MathliveInputComponent } from "./mathlive-input.component";

describe("MathliveInputComponent", () => 
{
  let component: MathliveInputComponent;
  let fixture: ComponentFixture<MathliveInputComponent>;

  beforeEach(() => 
{
    TestBed.configureTestingModule({
      declarations: [MathliveInputComponent]
    });
    fixture = TestBed.createComponent(MathliveInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => 
{
    expect(component).toBeTruthy();
  });
});
