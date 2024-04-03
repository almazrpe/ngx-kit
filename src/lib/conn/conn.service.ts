import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { StorageService } from "../../public-api";

@Injectable({
  providedIn: "root"
})
export class ConnService
{
  // first initialized by the app
  public serverHostPort$: Observable<string>;
  public serverWsUrl$: Observable<string>;
  public serverHttpUrl$: Observable<string>;

  public storageHostPortItemKey: string = "";
  public storageKey: string = "";

  public constructor(private storageSv: StorageService)
  {
  }

  public init(
    storageKey: string,
    storageHostPortItemKey: string = "conn_hostport",
    defaultHostPort?: string)
  {
    this.storageKey = storageKey;
    this.storageHostPortItemKey = storageHostPortItemKey;
    this.serverHostPort$ = this.storageSv.initItem$(
      storageKey, this.storageHostPortItemKey, defaultHostPort);

    this.serverWsUrl$ = this.serverHostPort$.pipe(
      map(hostport => "ws://" + hostport)
    );
    this.serverHttpUrl$ = this.serverHostPort$.pipe(
      map(hostport => "http://" + hostport)
    );
  }

  public setHostPort(val: string): void
  {
    this.storageSv.setItemVal(
      this.storageKey,
      this.storageHostPortItemKey,
      val);
  }
}
