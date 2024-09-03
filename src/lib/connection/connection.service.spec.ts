import { TestBed } from "@angular/core/testing";

import { ConService } from "./connection.service";

describe("ConService", () => {
  let service: ConService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
