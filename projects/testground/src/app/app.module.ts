import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NgxMinithingsModule } from "ngx-minithings";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NgxMinithingsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
