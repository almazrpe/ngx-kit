import { Component, Input } from "@angular/core";
import { ButtonMode } from "../button/button.component";

@Component({
  selector: "ngx-kit-refresh",
  templateUrl: "./refresh.component.html"
})
export class RefreshComponent
{
  @Input()
  public iconSelectors: string;
  @Input()
  public btnMode: ButtonMode = ButtonMode.DEFAULT;

  public refresh()
  {
    location.reload();
  }
}
