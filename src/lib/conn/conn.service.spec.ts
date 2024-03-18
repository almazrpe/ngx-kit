import { TestBed } from "@angular/core/testing";

import { ConnService } from "./conn.service";

describe("ConnService", () => 
{
  let service: ConnService;

  beforeEach(() => 
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnService);
  });

  it("should be created", () => 
  {
    expect(service).toBeTruthy();
  });
});
