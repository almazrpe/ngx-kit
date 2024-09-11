export interface IStorage<T>
{
    get(key: string): T | undefined;
    set(key: string, val: T): void
}
