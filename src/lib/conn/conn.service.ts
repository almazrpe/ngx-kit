import { Injectable } from "@angular/core";
import { map, Observable, ReplaySubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ConnService
{
  // first initialized by the app
  public serverHostPort$: ReplaySubject<string> = new ReplaySubject<string>();
  public serverWsUrl$: Observable<string>;
  public serverHttpUrl$: Observable<string>;

  public constructor()
  {
    this.serverWsUrl$ = this.serverHostPort$.pipe(
      map(hostport => "ws://" + hostport)
    );
    this.serverHttpUrl$ = this.serverHostPort$.pipe(
      map(hostport => "http://" + hostport)
    );
  }
}
