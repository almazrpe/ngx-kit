import {
  Directive,
  HostBinding,
  HostListener,
  Output,
  EventEmitter
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { UploadFileObject } from "./models";

@Directive({
  selector: "[appFileDragDrop]"
})
export class FileDragDropDirective 
{
  @Output() public files: EventEmitter<UploadFileObject[]> =
    new EventEmitter();

  @HostBinding("style.background") private background = "#ffffff00";

  public constructor(
    private sanitizer: DomSanitizer
  ) { }

  @HostListener("dragover", ["$event"])
  public onDragOver(event: DragEvent): void
  {
    event.preventDefault();
    event.stopPropagation();
    this.background = "#ffffff55";
  }

  @HostListener("dragleave", ["$event"])
  public onDragLeave(event: DragEvent): void
  {
    event.preventDefault();
    event.stopPropagation();
    this.background = "#ffffff00";
  }

  @HostListener("drop", ["$event"])
  public onDrop(event: DragEvent): void
  {
    event.preventDefault();
    event.stopPropagation();
    this.background = "#ffffff00";

    const files: UploadFileObject[] = [];
    if (event.dataTransfer != null)
    {
      for (let i = 0; i < event.dataTransfer.files.length; i++)
      {
        const file = event.dataTransfer.files[i];
        const url = this.sanitizer.bypassSecurityTrustUrl(
          window.URL.createObjectURL(file)
        );
        files.push({ file, url });
      }
      if (files.length > 0) 
      {
        this.files.emit(files);
      }
    }
  }
}
