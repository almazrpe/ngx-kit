import { IStorage } from "./models";

export class LocalStorage implements IStorage<string>
{
  public get(key: string): string | undefined
  {
    let f = localStorage.getItem(key);
    if (f === null)
    {
      return undefined;
    }
    return f;
  }

  public set(key: string, val: string): void
  {
    return localStorage.setItem(key, val);
  }
}
