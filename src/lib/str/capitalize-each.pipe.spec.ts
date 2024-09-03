import { CapitalizeEachPipe } from "./capitalize-each.pipe";

describe("CapitalizeEachPipe", () => {
  it("create an instance", () => {
    const pipe = new CapitalizeEachPipe();
    expect(pipe).toBeTruthy();
  });
});
