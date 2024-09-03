import { Err } from "./err";

// todo: remove call to asrt (to not even compute condition) from the final
//       prod build using webpack or something.

class AsrtErr extends Err {
  public constructor(msg?: string) {
    super(msg);
    console.warn("assert err encountered");
  }
}

export abstract class asrt {
  public static run(condition: boolean, msg?: string): void {
    if (!condition) {
      throw new AsrtErr(msg);
    }
  }

  public static fail(msg?: string): void {
    throw new AsrtErr(msg);
  }

  public static noimpl(s?: string): void {
    let msg: string = "not implemented";
    if (s !== undefined) {
      msg = s + " " + msg;
    }
    throw new AsrtErr(msg);
  }
}
