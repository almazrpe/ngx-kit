import { UnixTimestampToDatePipe } from "./unix-timestamp-to-date.pipe";

describe("UnixTimestampToDatePipe", () => 
{
  it("create an instance", () => 
  {
    const pipe = new UnixTimestampToDatePipe();
    expect(pipe).toBeTruthy();
  });
});
