import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DPSComponent } from "./dps.component";
import { UtilsModule } from "../utils.module";
import { ReactiveFormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    DPSComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UtilsModule,
  ],
  exports: [
    DPSComponent
  ]
})
export class DPSModule { }
