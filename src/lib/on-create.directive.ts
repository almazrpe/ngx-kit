import { Directive, Output, EventEmitter, } from "@angular/core";

@Directive({
    selector: "[NgxKitOnCreate]"
})
export class OnCreateDirective {
    @Output() public onCreate = new EventEmitter<void>();

    public ngOnInit(): void {
        this.onCreate.emit();
    }
}
