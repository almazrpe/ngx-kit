/**
 * Converts items array into typescript objects using a convertion function.
 *
 * @param items items array to convert
 * @param convertionFn convertion function to use for each item in the array
 * @returns array of typescript converted objects
 * @deprecated Use DTOUtils.convertMany.
 */
export function convertMany<T>(
  items: any[],
  convertionFn: (data: any) => T
): T[]
{
  const result: T[] = [];

  for (const item of items)
  {
    result.push(convertionFn(item));
  }

  return result;
}
