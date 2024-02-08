import { TestBed } from "@angular/core/testing";

import { SelectedInputService } from "./selected-input.service";

describe("SelectedInputService", () => 
{
  let service: SelectedInputService;

  beforeEach(() => 
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedInputService);
  });

  it("should be created", () => 
  {
    expect(service).toBeTruthy();
  });
});
