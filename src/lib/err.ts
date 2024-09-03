import { code } from "./fcode";

export abstract class Err extends Error {
}

@code("not-found-err")
export class NotFoundErr extends Err {
  public constructor(s: any) {
    super(`${s} is not found`);
  }
}

@code("duplicate-name-err")
export class DuplicateNameErr extends Err {
  public constructor(name: any, target: any) {
    super(`${name} is a duplicate name for ${target}`);
  }
}

@code("unique.field.err")
export class UniqueFieldErr extends Err {
  public constructor(s: any) {
    super(`${s}`);
  }
}

@code("type-expect-err")
export class TypeExpectErr extends Err {
  public constructor(s?: string, expected?: string, actual?: string) {
    let msg: string = s + " type";
    if (expected !== undefined) {
      msg += ", expected " + expected;
    }
    if (actual !== undefined) {
      msg += ", got " + actual;
    }
    super(msg);
  }
}

@code("already-processed-err")
export class AlreadyProcessedErr extends Err {
  public constructor(s: any) {
    super(`${s} is already processed`);
  }
}

@code("unsupported-err")
export class UnsupportedErr extends Err {
  public constructor(s: any) {
    super(`${s} is unsupported`);
  }
}

@code("inp-err")
export class InpErr extends Err {
  public constructor(s: any) {
    super(`${s} is invalid input`);
  }
}

/**
  * Some obj is locked to do read/write on it.
  */
@code("lock-err")
export class LockErr extends Err {
  public constructor(s: any) {
    super(`${s} is locked`);
  }
}

