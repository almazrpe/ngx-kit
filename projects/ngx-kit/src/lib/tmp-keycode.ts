export function code(c: string): (target: any) => void
{
  return (target: any) =>
  {
    console.log(target.constructor.prototype);
  };
}
