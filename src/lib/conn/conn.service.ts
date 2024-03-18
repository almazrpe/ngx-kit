import { Injectable } from "@angular/core";
import { map, Observable, ReplaySubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ConnService
{
  // first initialized by the app
  public cpasbHostPort$: ReplaySubject<string> = new ReplaySubject<string>();
  public cpasbWsUrl$: Observable<string>;
  public cpasbHttpUrl$: Observable<string>;

  public constructor()
  {
    this.cpasbWsUrl$ = this.cpasbHostPort$.pipe(
      map(hostport => "ws://" + hostport)
    );
    this.cpasbHttpUrl$ = this.cpasbHostPort$.pipe(
      map(hostport => "http://" + hostport)
    );
  }
}
