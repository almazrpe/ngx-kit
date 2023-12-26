import { AssertException } from "./exc";

export abstract class AssertConfig
{
  public static IsOptimized: boolean = false;
}

export function assert(condition: boolean, message?: string): void
{
  if (AssertConfig.IsOptimized)
  {
    return;
  }
  if (!condition)
  {
    throw new AssertException(message);
  }
}
