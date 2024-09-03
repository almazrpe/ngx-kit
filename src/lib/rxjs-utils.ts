import { map, take } from "rxjs";

export function takeOrSkip(count: number): any {
  if (count < 0) {
    // not sure this works - untested
    return map((...args: any[]) => args);
  }
  return take(count);
}

