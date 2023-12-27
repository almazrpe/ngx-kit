import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CoreErrorHandler } from "ngx-kit";
import { HttpClientModule } from "@angular/common/http";
import { NgxKitModule } from "ngx-kit/ngx-kit.module";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxKitModule
  ],
  providers: [
    CoreErrorHandler,
    {provide: ErrorHandler, useClass: CoreErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
