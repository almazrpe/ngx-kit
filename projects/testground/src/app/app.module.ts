import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MinithingsAngularModule } from "minithings-angular";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, MinithingsAngularModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
