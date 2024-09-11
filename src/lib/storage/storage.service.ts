import { Injectable } from "@angular/core";
import { IStorage } from "./models";
import { Observable, ReplaySubject } from "rxjs";
import { assert, panic } from "../../public-api";

/**
 * Synchronizes a key-val storage with rxjs.
 */
@Injectable({
    providedIn: "root"
})
export class StorageService {
    private storages: {[key: string]: IStorage<any>} = {};
    private items: {
        [storageKey: string]: {[itemKey: string]: ReplaySubject<any>};
    } = {};

    public addStorage<T>(key: string, storage: IStorage<T>): void {
        if (key in this.storages) {
            throw new Error(`key ${key} already registered`);
        }
        this.storages[key] = storage;
        this.items[key] = {};
    }

    public removeStorage(key: string): IStorage<any> {
        if (!(key in this.storages)) {
            panic("key " + key + " is not found");
        }
        let storage = this.storages[key];
        delete this.storages[key];
        assert(key in this.items);
        for (let itemKey in this.items[key]) {
            this.items[key][itemKey].complete();
        }
        delete this.items[key];
        return storage;
    }

    public addItem<T>(
        storageKey: string,
        itemKey: string,
        initVal?: T): void {
        this.addItem$(storageKey, itemKey, initVal);
    }

    public addItem$<T>(
        storageKey: string,
        itemKey: string,
        initVal?: T): Observable<T> {
        if (!(storageKey in this.storages) || !(storageKey in this.items)) {
            panic("storage with key " + storageKey + " is not found");
        }
        if (itemKey in this.items[storageKey]) {
            throw new Error("item key " + itemKey + " already registered");
        }
        let subj = new ReplaySubject<T>();
        this.items[storageKey][itemKey] = subj;
        if (initVal !== undefined) {
            this.setItemVal(storageKey, itemKey, initVal);
        } else {
          // retrieve storage value, if exists
            let storageVal = this.storages[storageKey].get(itemKey);
            if (storageVal !== undefined) {
                // don't call setItemVal for slightly better performance
                subj.next(storageVal);
            }
        }
        return subj.asObservable();
    }

    public initItem<T>(
        storageKey: string, itemKey: string, defaultVal?: T
    ): T {
        return this.getItem(storageKey, itemKey, defaultVal);
    }

    public initItem$<T>(
        storageKey: string, itemKey: string, defaultVal?: T): Observable<T> {
        return this.getItem$(storageKey, itemKey, defaultVal);
    }

    public getItem$<T>(
        storageKey: string, itemKey: string, defaultVal?: T): Observable<T> {
        if (!(storageKey in this.storages) || !(storageKey in this.items)) {
            panic("storage with key " + storageKey + " is not found");
        }
        this.getItem(storageKey, itemKey, defaultVal);
        let subj = this.items[storageKey][itemKey];
        return subj.asObservable();
    }

    public getItem<T>(storageKey: string, itemKey: string, defaultVal?: T): T {
        if (!(storageKey in this.storages) || !(storageKey in this.items)) {
            panic("storage with key " + storageKey + " is not found");
        }
        let storageVal = this.storages[storageKey].get(itemKey);
        if (!(itemKey in this.items[storageKey])) {
            // use existing val from storage
            if (storageVal !== undefined) {
              defaultVal = storageVal;
            }
            if (defaultVal === undefined) {
              panic("item with key " + itemKey + "is not found");
            }
            this.addItem$(storageKey, itemKey, defaultVal);
            return this.getItem(storageKey, itemKey);
        }
        let newval = this.storages[storageKey].get(itemKey);
        return newval;
    }

    public setItemVal(storageKey: string, itemKey: string, val: any): void {
        if (!(storageKey in this.storages) || !(storageKey in this.items)) {
            panic("storage with key " + storageKey + "is not found");
        }
        if (!(itemKey in this.items[storageKey])) {
            this.addItem$(storageKey, itemKey, val);
        }
        this.storages[storageKey].set(itemKey, val);
        this.items[storageKey][itemKey].next(val);
    }
}
