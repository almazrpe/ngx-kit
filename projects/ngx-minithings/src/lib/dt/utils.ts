/**
 * Converts UNIX timestamp to current local Date.
*/
export function convertTimestamp(timestamp: number): Date 
{
  return new Date(timestamp * 1000);
}
