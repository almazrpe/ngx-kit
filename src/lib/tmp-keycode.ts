/**
 * @deprecated
 * Not used and could be removed.
 * Use code from fcode.ts instead
 */
export function code(c: string): any
{
  return <T extends { new(...args: any[]): any }>(target: T) =>
  {
    // set Code field dynamically for applied class
    // ref: https://stackoverflow.com/a/54813533
    const a: T = class extends target
    {
      // eslint-disable-next-line
      Code = c;
    };
    return a;
  };
}
