import { Component, OnInit, Output, Input, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { InputType } from "../input/input-type";
import { UploadFilesInputConfig } from "../input/upload-files-input/models";
import { ButtonMode } from "../button/button.component";
import { FormValidationUtils } from "../validation";
import { I18nService } from "../i18n/i18n.service";
import { PopUpService } from "./pop-up.service";
import {
  PopUpType,
  PopUpConfig,
  makePopUpConfig,
  PopUpFormField,
  PopUpWindow,
  PopUpResult,
  PopUpDescriptorField,
  PopUpChoosingBtn
} from "./models";

@Component({
  selector: "ngx-kit-pop-up",
  templateUrl: "./pop-up.component.html",
  styles: [
  ]
})
export class PopUpComponent implements OnInit
{
  @Input() public config: Partial<PopUpConfig> = {};
  @Output() public onComplete: EventEmitter<PopUpResult> =
    new EventEmitter<PopUpResult>();

  private windowNum: number;
  public type: PopUpType = PopUpType.Empty;
  public title: string;
  public fields: PopUpFormField[];
  public controls: FormControl[];
  public choosingButtons: PopUpChoosingBtn[];
  public formFieldsDescriptor:
    ((data: any) => PopUpDescriptorField[]) | null =
      null;
  public descriptorFields: PopUpDescriptorField[] = [];

  public form: FormGroup = new FormGroup({
    answer: new FormControl(null, [Validators.required])
  });

  public InputType: any = InputType;
  public PopUpType: any = PopUpType;
  public ButtonMode: any = ButtonMode;
  public _config_: PopUpConfig;

  public constructor(
    public popUpService: PopUpService,
    public translation: I18nService
  ) {}

  public ngOnInit(): void
  {
    this._config_ = makePopUpConfig(this.config);
    this.popUpService.popUpWindow$.subscribe({
      next: (window: PopUpWindow) =>
      {
        this.windowNum = window.windowNum;
        this.type = window.type;
        this.title = window.title;

        window.fields = window.fields ?? [];
        if (this.type == PopUpType.Form)
        {
          this.form = new FormGroup({});
          window.fields.forEach((field: PopUpFormField) =>
          {
            if (field.fillingOptions == undefined)
              field.fillingOptions = new BehaviorSubject<any[]>([]);

            this.form.addControl(
              field.name,
              new FormControl(
                field.value, 
                (field.validators ?? []).concat(
                  field.autocompleteRequired === true 
                    ? FormValidationUtils.requiredAutocompleteValidator(
                      field.fillingOptions
                    ) 
                    : []
                )
              ),
              {
                emitEvent: false
              }
            );

            if (field.fillingFunction != undefined)
            {
              if (field.hideField == undefined)
                field.hideField = new BehaviorSubject<boolean>(true);

              this.form.valueChanges.subscribe(
                (controlsData: any) => field.fillingFunction != null
                  ? field.fillingFunction(
                    controlsData,
                    this.getFormControl(field.name),
                      field.hideField!,
                      field.fillingOptions!
                  )
                  : []
              );
            }
          });

          if (window.formFieldsDescriptor != null)
          {
            this.formFieldsDescriptor = window.formFieldsDescriptor;
            this.descriptorFields = this.formFieldsDescriptor(null);
            this.form.valueChanges.subscribe(
              (data: any) =>
                this.descriptorFields = this.formFieldsDescriptor != null
                  ? this.formFieldsDescriptor(data)
                  : []
            );
          }
          else
          {
            this.formFieldsDescriptor = null;
            this.descriptorFields = [];
          }
        }

        this.fields = window.fields;
        this.controls = this.getAllFormControls();
        this.choosingButtons = window.choosingButtons ?? [];
      },
      error: (err: Error) =>
      {
        throw err;
      }
    });
  }

  public uploadFilesInputConfig(): UploadFilesInputConfig
  {
    return this._config_ as UploadFilesInputConfig;
  }

  public closePopUp(): void
  {
    this.popUpService.toggle();
  }

  public borderClosingCheck(event: MouseEvent): void
  {
    const elem: Element | null =
      document.elementFromPoint(event.clientX, event.clientY);
    if (elem != null && elem.id == "pop-up-container")
    {
      if (this.type == PopUpType.Form)
      {
        if (this.form.valid == false)
          this.closePopUp();
      }
      else
        this.closePopUp();
    }
  }

  public getFormControl(name: string): FormControl
  {
    return this.form.get(name) as FormControl;
  }

  public getAllFormControls(): FormControl[]
  {
    return this.fields.map((field: PopUpFormField) =>
      this.getFormControl(field.name));
  }

  public sendAnswer(ans: any): void
  {
    this.onComplete.emit({
      windowNum: this.windowNum,
      value: ans
    });
    this.closePopUp();
  }

  public sendForm(): void
  {
    this.onComplete.emit({
      windowNum: this.windowNum,
      value: this.form.value
    });
    this.closePopUp();
  }
}
