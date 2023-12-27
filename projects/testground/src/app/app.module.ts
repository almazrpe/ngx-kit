import { ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CoreErrorHandler, TranslationUtils } from "ngx-kit";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgxKitModule } from "ngx-kit/ngx-kit.module";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxKitModule,
    TranslateModule.forRoot({
      defaultLanguage: "en",
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) =>
        {
          return TranslationUtils.createHttpLoader(
            http, "assets/locale/codes/", ".json"
          );
        },
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    CoreErrorHandler,
    {provide: ErrorHandler, useClass: CoreErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
