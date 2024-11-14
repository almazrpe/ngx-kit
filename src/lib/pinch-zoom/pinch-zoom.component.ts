import { 
    Component, 
    ElementRef, 
    EventEmitter,
    HostBinding, 
    Input, 
    OnChanges, 
    OnDestroy, 
    OnInit, 
    Output, 
    SimpleChanges 
} from "@angular/core";
import { Properties } from "./interfaces";
import { 
    defaultProperties, 
    backwardCompatibilityProperties 
} from "./properties";
import { IvyPinch } from "./ivypinch";
import { PinchZoomTransform } from "./model";

interface ComponentProperties extends Properties {
    disabled?: boolean;
    overflow?: "hidden" | "visible";
    disableZoomControl?: "disable" | "never" | "auto";
    backgroundColor?: string;
    [key: string]: any
}

export const _defaultComponentProperties: ComponentProperties = {
    overflow: "hidden",
    disableZoomControl: "auto",
    backgroundColor: "rgba(0,0,0,0.85)",
};

@Component({
    selector: "pinch-zoom, [pinch-zoom]",
    exportAs: "pinchZoom",
    templateUrl: "./pinch-zoom.component.html",
    styleUrls: ["./pinch-zoom.component.sass"],
})
export class PinchZoomComponent implements OnInit, OnDestroy, OnChanges {
    private pinchZoom: IvyPinch;
    private _properties!: ComponentProperties;
    private readonly defaultComponentProperties!: ComponentProperties;
    private _transitionDuration!: number;
    private _doubleTap!: boolean;
    private _doubleTapScale!: number;
    private _autoZoomOut!: boolean;
    private _limitZoom!: number | "original image size";

    @Input("properties") 
    public set properties(value: ComponentProperties) {
        if (value) {
            this._properties = value;
        }
    }

    public get properties(): ComponentProperties {
        return this._properties;
    }

    // transitionDuration
    @Input("transition-duration") 
    public set transitionDurationBackwardCompatibility(
        value: number
    ) {
        if (value) {
            this._transitionDuration = value;
        }
    }

    @Input("transitionDuration") 
    public set transitionDuration(value: number) {
        if (value) {
            this._transitionDuration = value;
        }
    }

    public get transitionDuration(): number {
        return this._transitionDuration;
    }

    // doubleTap
    @Input("double-tap") 
    public set doubleTapBackwardCompatibility(value: boolean) {
        if (value) {
            this._doubleTap = value;
        }
    }

    @Input("doubleTap") 
    public set doubleTap(value: boolean) {
        if (value) {
            this._doubleTap = value;
        }
    }

    public get doubleTap(): boolean {
        return this._doubleTap;
    }

    // doubleTapScale
    @Input("double-tap-scale") 
    public set doubleTapScaleBackwardCompatibility(
        value: number
    ) {
        if (value) {
            this._doubleTapScale = value;
        }
    }

    @Input("doubleTapScale") 
    public set doubleTapScale(value: number) {
        if (value) {
            this._doubleTapScale = value;
        }
    }

    public get doubleTapScale(): number {
        return this._doubleTapScale;
    }

    // autoZoomOut
    @Input("auto-zoom-out") 
    public set autoZoomOutBackwardCompatibility(
        value: boolean
    ) {
        if (value) {
            this._autoZoomOut = value;
        }
    }

    @Input("autoZoomOut") 
    public set autoZoomOut(value: boolean) {
        if (value) {
            this._autoZoomOut = value;
        }
    }

    public get autoZoomOut(): boolean {
        return this._autoZoomOut;
    }

    // limitZoom
    @Input("limit-zoom") 
    public set limitZoomBackwardCompatibility(
        value: number | "original image size"
    ) {
        if (value) {
            this._limitZoom = value;
        }
    }

    @Input("limitZoom") 
    public set limitZoom(value: number | "original image size") {
        if (value) {
            this._limitZoom = value;
        }
    }

    public get limitZoom(): number | "original image size" {
        return this._limitZoom;
    }

    @Input() public disabled!: boolean;
    @Input() public disablePan!: boolean;
    @Input() public overflow!: "hidden" | "visible";
    @Input() public zoomControlScale!: number;
    @Input() public disableZoomControl!: "disable" | "never" | "auto";
    @Input() public backgroundColor!: string;
    @Input() public limitPan!: boolean;
    @Input() public minPanScale!: number;
    @Input() public minScale!: number;
    @Input() public listeners!: "auto" | "mouse and touch";
    @Input() public wheel!: boolean;
    @Input() public autoHeight!: boolean;
    @Input() public wheelZoomFactor!: number;
    @Input() public draggableImage!: boolean;
    @Input() public initialTransform: PinchZoomTransform | undefined = 
        undefined;

    /**
     * Emits an event (with the component value inside)
     * whenever the value changes.
     */
    @Output() public transformChange: EventEmitter<any> = 
        new EventEmitter<any>();

    @HostBinding("style.overflow")
    public get hostOverflow(): "hidden" | "visible" {
        return this.properties["overflow"] ?? "hidden";
    }

    @HostBinding("style.background-color")
    public get hostBackgroundColor(): string {
        return this.properties["backgroundColor"] ?? "rgba(0,0,0,0.85)";
    }

    public get isTouchScreen(): boolean {
        const prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
        const mq = (query: string): boolean => {
            return window.matchMedia(query).matches;
        };

        if ("ontouchstart" in window) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help 
        // terminate the join
        // https://git.io/vznFH
        const query = [
            "(", 
            prefixes.join("touch-enabled),("), 
            "heartz", 
            ")"
        ].join("");
        return mq(query);
    }

    public get isDragging(): boolean {
        return this.pinchZoom?.isDragging();
    }

    public get isDisabled(): boolean {
        return this._properties.disabled ?? true;
    }

    public get scale(): number {
        return this.pinchZoom.scale;
    }

    public get isZoomedIn(): boolean {
        return this.scale > 1;
    }

    public get scaleLevel(): number {
        return Math.round(this.scale / this._zoomControlScale);
    }

    public get maxScale(): number {
        return this.pinchZoom.maxScale;
    }

    public get isZoomLimitReached(): boolean {
        return this.scale >= this.maxScale;
    }

    public get _zoomControlScale(): number {
        return this.getPropertiesValue("zoomControlScale") ?? 1;
    }

    public constructor(private elementRef: ElementRef<HTMLElement>) {
        this.defaultComponentProperties = this.getDefaultComponentProperties();
        this.applyPropertiesDefault(this.defaultComponentProperties, {});
    }

    public ngOnInit(): void {
        this.initPinchZoom();

        /* Calls the method until the image size is available */
        this.detectLimitZoom();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        let changedProperties = this.getProperties(changes);
        changedProperties = this.renameProperties(changedProperties);
        changedProperties = {
            ...this.properties,
            ...changedProperties
        }

        this.applyPropertiesDefault(
            this.defaultComponentProperties, 
            changedProperties
        );
    }

    public ngOnDestroy(): void {
        this.destroy();
    }

    private initPinchZoom(): void {
        if (this._properties.disabled) {
            return;
        }

        this._properties.limitZoom = this.limitZoom;
        this._properties.element = 
            this.elementRef.nativeElement.querySelector(".pinch-zoom-content")
                ?? undefined;
        this._properties.initialTransform = this.initialTransform
        this.pinchZoom = new IvyPinch(this.properties);
        this.pinchZoom.transformChange.subscribe({
            next: (transform: PinchZoomTransform) => {
                this.transformChange.emit(transform);
            }
        })
    }

    private getProperties(
        changes: SimpleChanges,
    ): ComponentProperties | Record<
        keyof typeof backwardCompatibilityProperties, unknown
    > {
        let properties: ComponentProperties = {};

        for (const prop in changes) {
            if (prop !== "properties") {
                properties[prop] = changes[prop].currentValue;
            }
            if (prop === "properties") {
                properties = changes[prop].currentValue;
            }
        }
        return properties;
    }

    private renameProperties(
        properties: ComponentProperties | Record<
            keyof typeof backwardCompatibilityProperties, unknown
        >,
    ): ComponentProperties {
        for (const prop in properties) {
            if (backwardCompatibilityProperties[prop]) {
                properties[backwardCompatibilityProperties[prop]] = 
                    properties[prop];
                delete properties[prop];
            }
        }

        return properties as ComponentProperties;
    }

    private applyPropertiesDefault(
        defaultProperties: ComponentProperties, 
        properties: ComponentProperties
    ): void {
        this.properties = Object.assign({}, defaultProperties, properties);
    }

    public toggleZoom(): void {
        this.pinchZoom?.toggleZoom();
    }

    public isControl(): boolean {
        if (this.isDisabled) {
            return false;
        }

        if (this._properties.disableZoomControl === "disable") {
            return false;
        }

        if (
            this.isTouchScreen 
            && this._properties.disableZoomControl === "auto"
        ) {
            return false;
        }

        return true;
    }

    public detectLimitZoom(): void {
        this.pinchZoom?.detectLimitZoom();
    }

    public destroy(): void {
        this.pinchZoom?.destroy();
    }

    private getPropertiesValue<K extends keyof ComponentProperties>(
        propertyName: K
    ): ComponentProperties[K] {
        if (this.properties && this.properties[propertyName]) {
            return this.properties[propertyName];
        } else {
            return this.defaultComponentProperties[propertyName];
        }
    }

    private getDefaultComponentProperties(): ComponentProperties {
        return { ...defaultProperties, ..._defaultComponentProperties };
    }
}
