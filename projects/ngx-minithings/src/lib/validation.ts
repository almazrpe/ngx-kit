export function never(value: never): Error
{
  return new Error(`you should define logic to handle ${value}`);
}
