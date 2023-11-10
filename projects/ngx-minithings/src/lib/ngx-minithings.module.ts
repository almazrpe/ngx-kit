import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InputComponent } from "./input/input.component";
import { AlertComponent } from "./alert/alert.component";
import { ButtonComponent } from "./button/button.component";
import { BlockComponent } from "./block/block.component";
import { DatalistComponent } from "./datalist/datalist.component";
import { DPSComponent } from "./dps/dps.component";
import { HrComponent } from "./hr/hr.component";
import { KeyboardComponent } from "./keyboard/keyboard.component";
import { LoadingComponent } from "./loading/loading.component";
import {
  StatusCircleComponent
} from "./status-circle/status-circle.component";
import { AlertStackComponent } from "./alert/alert-stack.component";
import { ReactiveFormsModule } from "@angular/forms";
import { UnixTimestampToDatePipe } from "./dt/unix-timestamp-to-date.pipe";
import { CapitalizeEachPipe } from "./str/capitalize-each.pipe";
import { CapitalizePipe } from "./str/capitalize.pipe";
import { PaginationComponent } from "./pagination/pagination.component";
import { IncludesPipe } from "./includes.pipe";
import { PaginationOverflowDirective }
  from "./pagination/pagination-overflow.directive";

import { BrowserAnimationsModule }
  from "@angular/platform-browser/animations";
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS }
  from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";

//import { MatDatepickerModule } from "@angular/material/datepicker";
//import { MatNativeDateModule, MAT_DATE_LOCALE }
//  from '@angular/material/core';

import { MatInputComponent } from "./input/mat-input/mat-input.component";

@NgModule({
  declarations: [
    ButtonComponent,
    InputComponent,
    AlertComponent,
    AlertStackComponent,
    BlockComponent,
    DatalistComponent,
    DPSComponent,
    HrComponent,
    KeyboardComponent,
    LoadingComponent,
    StatusCircleComponent,
    UnixTimestampToDatePipe,
    CapitalizeEachPipe,
    CapitalizePipe,
    PaginationComponent,
    IncludesPipe,
    PaginationOverflowDirective,
    MatInputComponent
  ],
  providers: [
    //{ provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: "outline"}
    }
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    BrowserAnimationsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,

    //MatDatepickerModule,
    //MatNativeDateModule,

  ],
  exports: [
    IncludesPipe,
    ButtonComponent,
    InputComponent,
    AlertStackComponent,
    BlockComponent,
    DatalistComponent,
    DPSComponent,
    HrComponent,
    KeyboardComponent,
    LoadingComponent,
    StatusCircleComponent,
    UnixTimestampToDatePipe,
    CapitalizeEachPipe,
    CapitalizePipe,
    PaginationComponent,
    MatInputComponent
  ]
})
export class NgxMinithingsModule { }
