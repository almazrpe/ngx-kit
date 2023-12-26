import { AssertException } from "./exc";

const IsOptimized: boolean =
  process.env["NGXKIT_OPTIMIZE"] === "1" ? true : false;

export default function assert(condition: boolean, message?: string): void
{
  if (IsOptimized)
  {
    return;
  }
  if (!condition)
  {
    throw new AssertException(message);
  }
}
