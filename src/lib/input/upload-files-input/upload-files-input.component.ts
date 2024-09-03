import { Component, OnInit, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import {
  Observable,
  map,
  of,
  timeoutWith
} from "rxjs";
import { ButtonMode } from "../../button/button.component";
import { AlertService } from "../../alert/alert.service";
import { AlertLevel } from "../../alert/models";
import {
  UploadFileObject,
  UploadFilesInputConfig,
  makeUploadFilesInputConfig
} from "./models";

@Component({
  selector: "ngx-kit-upload-files-input",
  templateUrl: "./upload-files-input.component.html",
  styles: [
  ]
})
export class UploadFilesInputComponent implements OnInit {
  @Input() public control: FormControl = new FormControl(null);
  @Input() public fileExtensions: Set<string> | undefined;
  @Input() public checkFunc: undefined
    | ((files: UploadFileObject[]) => Observable<UploadFileObject[] | null>);
  @Input() public config: Partial<UploadFilesInputConfig> = {};

  public _config_: UploadFilesInputConfig;
  public ButtonMode: any = ButtonMode;
  public Array: any = Array;

  public constructor(
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
  ) {}

  public ngOnInit(): void {
    this._config_ = makeUploadFilesInputConfig(this.config);
    this.fileExtensions = this.fileExtensions ?? new Set();
    this.checkFunc = this.checkFunc
      ?? ((files: UploadFileObject[]): Observable<null> => of(null));
  }

  private addNewFilesToControl(
    files: UploadFileObject[],
    control: FormControl
  ): void {
    this.checkFunc!(files).pipe(
      timeoutWith(10000, of([])),
      map((acceptedFiles: UploadFileObject[] | null) => {
        if (acceptedFiles != null)
          return acceptedFiles;
        else
          return files;
      }),
    ).subscribe({
      next: (acceptedFiles: UploadFileObject[]) => {
        const acceptedFilenames: Set<string> =
          new Set(acceptedFiles.map((obj: UploadFileObject) => obj.file.name));

        if (control.value == null)
          control.setValue([]);
        control.setValue(
          control.value.filter((obj: UploadFileObject) => {
            const filename: string = obj.file.name;
            if (acceptedFilenames.has(filename)) {
              this.alertService.spawn({
                level: AlertLevel.Warning,
                msg:
                  `«${filename}» ${this._config_.filenameRepeatTranslation}`
              });
              return false;
            } else
              return true;
          }).concat(acceptedFiles)
        );
      }
    });
  }

  public filesDropped(files: UploadFileObject[], control: FormControl): void {
    files = files.filter((obj: UploadFileObject) => {
      const splitFilename: string[] = obj.file.name.split(".");
      if (splitFilename.length < 2) {
        this.alertService.spawn({
          level: AlertLevel.Warning,
          msg:
            `«${obj.file.name}» ${this._config_.unknownExtensionTranslation}`
        });
        return false;
      } else {
        if (
          this.fileExtensions != null
            ? this.fileExtensions.has(
              ".".concat(splitFilename.pop() ?? "")
            ) == false
            : false
        ) {
          this.alertService.spawn({
            level: AlertLevel.Warning,
            msg:
              `«${obj.file.name}» ${this._config_.wrongExtensionTranslation}`
          });
          return false;
        } else
          return true;
      }
    });
    this.addNewFilesToControl(files, control);
  }

  public filesBrowsed(event: any, control: FormControl): void {
    const files: UploadFileObject[] = [];
    for (const file of event.target.files) {
      files.push({
        file: file,
        url: this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(file)
        )
      });
    }
    this.addNewFilesToControl(files, control);
  }

  public fileCanceled(ind: number, control: FormControl): void {
    control.setValue(control.value.toSpliced(ind, 1));
  }

  public setDefaultImage(event: any): void {
    event.target.src = this._config_.unknownDocIconPath;
  }

}
