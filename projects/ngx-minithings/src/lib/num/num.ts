export function hasNumber(text: string): boolean 
{
  return /\d/.test(text);
}

export function hasOnlyNumbers(text: string): boolean 
{
  return /^\d+$/.test(text);
}
