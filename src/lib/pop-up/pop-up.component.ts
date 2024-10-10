import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  TemplateRef
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BehaviorSubject, Observable, of, Subscription } from "rxjs";
import { InputType } from "../input/input-type";
import { UploadFilesInputConfig } from "../input/upload-files-input/models";
import { ButtonMode } from "../button/button.component";
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
  PopUpPaginationData,
  PopUpChoosingBtn
} from "./models";
import { StringUtils } from "../../public-api";

@Component({
  selector: "ngx-kit-pop-up",
  templateUrl: "./pop-up.component.html",
  styles: [
  ]
})
export class PopUpComponent implements OnInit {
  @Input() public config: Partial<PopUpConfig> = {};
  @Output() public onComplete: EventEmitter<PopUpResult> =
    new EventEmitter<PopUpResult>();

  public compId: string = StringUtils.makeid(10);
  private windowNum: number;
  public type: PopUpType = PopUpType.Empty;
  public title: string;
  public resOnClosing: boolean;
  public fields: PopUpFormField[];
  public controls: FormControl[];
  public choosingButtons: PopUpChoosingBtn[];
  public paginationData: PopUpPaginationData;
  public mainTemplateRef: TemplateRef<any> | null;
  public extraHeaderTemplateRef: TemplateRef<any> | null;
  public formFieldsDescriptor:
    ((data: any) => PopUpDescriptorField[]) | null =
      null;
  public descriptorFields: PopUpDescriptorField[] = [];
  public internalCache: Map<string, any>;
  private controlFunctionSub: Subscription;
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

  public ngOnInit(): void {
    this._config_ = makePopUpConfig(this.config);
    this.popUpService.popUpWindow$.subscribe({
      next: (window: PopUpWindow) => {
        this.windowNum = window.windowNum;
        this.type = window.type;
        this.title = window.title;
        this.resOnClosing = window.resOnClosing ?? false;

        window.fields = window.fields ?? [];
        if (this.type == PopUpType.Form) {
          this.form = new FormGroup({});
          window.fields.forEach((field: PopUpFormField) => {
            if (field.hideField == undefined)
              field.hideField = new BehaviorSubject<boolean>(false);
            if (field.fillingOptions == undefined)
              field.fillingOptions = new BehaviorSubject<any[]>([]);

            this.form.addControl(
              field.name,
              new FormControl(
                field.value, 
                field.validators ?? []
              ),
              {
                emitEvent: false
              }
            );
          });

          if (window.controlFunction !== undefined) {
            this.internalCache = new Map<string, any>();
            this.controlFunctionSub = this.form.valueChanges.subscribe(
              (controlsData: any) =>
                window.controlFunction!(
                  controlsData,
                  this.form,
                  new Map<string, BehaviorSubject<boolean>>(
                    window.fields?.map(
                      (field: PopUpFormField) => [
                        field.name, 
                        field.hideField ?? new BehaviorSubject<boolean>(true)
                      ]
                    ) ?? []
                  ),
                  new Map<string, BehaviorSubject<any[]>>(
                    window.fields?.map(
                      (field: PopUpFormField) => [
                        field.name, 
                        field.fillingOptions ?? new BehaviorSubject<any[]>([])
                      ]
                    ) ?? []
                  ),
                  this.internalCache
                )
            );
          }

          if (window.formFieldsDescriptor != null) {
            this.formFieldsDescriptor = window.formFieldsDescriptor;
            this.descriptorFields = this.formFieldsDescriptor(null);
            this.form.valueChanges.subscribe(
              (data: any) =>
                this.descriptorFields = this.formFieldsDescriptor != null
                  ? this.formFieldsDescriptor(data)
                  : []
            );
          } else {
            this.formFieldsDescriptor = null;
            this.descriptorFields = [];
          }
        }

        this.fields = window.fields;
        this.controls = this.getAllFormControls();
        this.choosingButtons = window.choosingButtons ?? [];
        this.paginationData = window.paginationData ?? { items: [] };
        this.mainTemplateRef = window.templateRefs?.main ?? null;
        this.extraHeaderTemplateRef = window.templateRefs?.extraHeader ?? null;
      },
      error: (err: Error) => {
        throw err;
      }
    });
  }

  public uploadFilesInputConfig(): UploadFilesInputConfig {
    return this._config_ as UploadFilesInputConfig;
  }

  public closePopUp(): void {
    if (this.controlFunctionSub !== undefined)
      this.controlFunctionSub.unsubscribe();
    this.popUpService.toggle(undefined);
  }

  public clearField(name: string): void {
    this.form.patchValue({
      [name]: null
    });
  }

  public borderClosingCheck(event: MouseEvent): void {
    const elem: Element | null =
      document.elementFromPoint(event.clientX, event.clientY);
    if (elem != null && elem.id == "pop-up-container") {
      if (this._config_.closeUsingBtnOnly == true)
        return;

      if (this.type == PopUpType.Form) {
        if (this.form.valid == false) {
          this.checkROCAndClosePopUp();
        }
      } else {
        this.checkROCAndClosePopUp();
      }
    }
  }

  public getFormControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  public getAllFormControls(): FormControl[] {
    return this.fields.map((field: PopUpFormField) =>
      this.getFormControl(field.name));
  }

  public checkROCAndClosePopUp(): void {
    this.closePopUp();
    if (this.resOnClosing) {
      this.onComplete.emit({
        windowNum: this.windowNum,
        value: undefined
      });
    }
  }

  public sendAnswer(ans: any): void {
    this.closePopUp();
    this.onComplete.emit({
      windowNum: this.windowNum,
      value: ans
    });
  }

  public sendForm(): void {
    this.closePopUp();
    this.onComplete.emit({
      windowNum: this.windowNum,
      value: this.form.value
    });
  }

  public getNullObservable(): Observable<null> {
    return of(null);
  }
}
