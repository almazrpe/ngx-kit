import { Injectable } from "@angular/core";
import { IStorage } from "./models";
import { NotFoundErr } from "../err";
import { Observable, ReplaySubject } from "rxjs";
import { asrt } from "../asrt";

/**
 * Synchronizes a key-val storage with rxjs.
 */
@Injectable({
  providedIn: "root"
})
export class StorageService
{
  private storages: {[key: string]: IStorage<any>};
  private items: {
    [storageKey: string]: {[itemKey: string]: ReplaySubject<any>};
  } = {};

  public addStorage<T>(key: string, storage: IStorage<T>): void
  {
    if (key in this.storages)
    {
      throw new Error(`key ${key} already registered`);
    }
    this.storages[key] = storage;
    this.items[key] = {};
  }

  public removeStorage(key: string): IStorage<any>
  {
    if (!(key in this.storages))
    {
      throw new NotFoundErr("key " + key);
    }
    let storage = this.storages[key];
    delete this.storages[key];
    asrt.run(key in this.items);
    for (let itemKey in this.items[key])
    {
      this.items[key][itemKey].complete();
    }
    delete this.items[key];
    return storage;
  }

  public addItem$<T>(
    storageKey: string,
    itemKey: string,
    initVal?: T): Observable<T>
  {
    if (!(storageKey in this.storages) || !(storageKey in this.items))
    {
      throw new NotFoundErr("storage with key " + storageKey);
    }
    if (itemKey in this.items[storageKey])
    {
      throw new Error("item key " + itemKey + " already registered");
    }
    let subj = new ReplaySubject<T>();
    this.items[storageKey][itemKey] = subj;
    if (initVal !== undefined)
    {
      this.setItemVal(storageKey, itemKey, initVal);
    }
    else
    {
      // retrieve storage value, if exists
      let storageVal = this.storages[storageKey].get(itemKey);
      if (storageVal !== undefined)
      {
        // don't call setItemVal for slightly better performance
        subj.next(storageVal);
      }
    }
    return subj.asObservable();
  }

  public getItem$<T>(storageKey: string, itemKey: string): Observable<T>
  {
    if (!(storageKey in this.storages) || !(storageKey in this.items))
    {
      throw new NotFoundErr("storage with key " + storageKey);
    }
    if (!(itemKey in this.items[storageKey]))
    {
      throw new NotFoundErr("item with key " + itemKey);
    }
    // on every get, the target item key is refreshed
    let subj = this.items[storageKey][itemKey];
    subj.next(this.storages[storageKey].get(itemKey));
    return subj.asObservable();
  }

  public setItemVal(storageKey: string, itemKey: string, val: any): void
  {
    if (!(storageKey in this.storages) || !(storageKey in this.items))
    {
      throw new NotFoundErr("storage with key " + storageKey);
    }
    if (!(itemKey in this.items[storageKey]))
    {
      throw new NotFoundErr("item with key " + itemKey);
    }
    this.storages[storageKey].set(itemKey, val);
    this.items[storageKey][itemKey].next(val);
  }
}
