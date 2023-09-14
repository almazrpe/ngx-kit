import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import FingerprintJS, { Agent } from "@fingerprintjs/fingerprintjs";

@Injectable({
  providedIn: "root"
})
export class LogService
{
  private browserFingerprint: string;

  public constructor(
    private http: HttpClient
  )
  {
    // Generate fingerprint of current browser
    const fingerprintPromise: Promise<Agent> = FingerprintJS.load({
      monitoring: false
    });
    fingerprintPromise
      .then(fp => fp.get())
      .then(result =>
      {
        this.browserFingerprint = result.visitorId;
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private log(level: string, message: string): void
  {
    // take user token manually to avoid circular DI
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userToken: string | null = localStorage.getItem("user_token");

    // let obs: Observable<any> = this.http.post(
    //   '/hqf/log',
    //   {
    //     'level': level,
    //     'timestamp': new Date().getTime() / 1000,
    //     'message': message,
    //     'fingerprint': this.browserFingerprint,
    //     // If problem with user token obtaining occured, use empty string
    //     'user_token': userToken ? userToken : ''
    //   });
    // obs.subscribe({
    //   error: (error: Error) => console.error(
    //     `Couldn\'t send log to server, error: ${JSON.stringify(error)}`)
    // });
  }

  public debug(message: string): void
  {
    console.debug(message);
    this.log("debug", message);
  }

  public info(message: string): void
  {
    console.info(message);
    this.log("info", message);
  }

  public warning(message: string): void
  {
    console.warn(message);
    this.log("warning", message);
  }

  public error(error: Error): void;
  public error(message: string): void;
  public error(value: string | Error): void
  {
    const message: string = JSON.stringify(value);

    console.error(value);
    this.log("error", message);
  }
}
