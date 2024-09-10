import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { PopUpType, PopUpWindow } from "./models";

@Injectable({
    providedIn: "root"
})
export class PopUpService {
    private popUpWindow: BehaviorSubject<PopUpWindow> =
        new BehaviorSubject<PopUpWindow>({
            windowNum: -1,
            type: PopUpType.YesNo,
            title: ""
        });
    public popUpWindow$: Observable<PopUpWindow> =
        this.popUpWindow.asObservable();

    public isShown$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);

    public toggle(): void {
        this.isShown$.next(!this.isShown$.value);
    }

    public spawn(window: PopUpWindow): void {
        this.popUpWindow.next(window);
        this.toggle();
    }
}
