import { EventType, Touches } from "./touches";
import { Properties } from "./interfaces";
import { defaultProperties } from "./properties";
import { panic } from "../utils";
import { ReplaySubject } from "rxjs";
import { PinchZoomTransform } from "./model";

export class IvyPinch {
    private readonly properties: Properties = defaultProperties;
    private touches: Touches;
    private readonly element: HTMLElement;
    private readonly elementTarget: string;
    private parentElement: HTMLElement;
    public scale: number = 1;
    private initialScale: number = 1;
    private elementPosition: DOMRect;
    private eventType: EventType;
    private startX: number = 0;
    private startY: number = 0;
    private moveX: number = 0;
    private moveY: number = 0;
    private initialMoveX: number = 0;
    private initialMoveY: number = 0;
    private moveXC: number = 0;
    private moveYC: number = 0;
    private distance: number = 0;
    private initialDistance: number = 0;
    public maxScale!: number;
    private defaultMaxScale: number = 3;
    public transformChange: ReplaySubject<PinchZoomTransform> = 
        new ReplaySubject(1)

    // Minimum scale at which panning works
    public get minPanScale(): number {
        return this.getPropertiesValue("minPanScale") ?? 1;
    }

    public get fullImage(): { path: string; minScale?: number } {
        if (this.properties.fullImage !== undefined) {
            return this.properties.fullImage;
        } else {
            panic()
        }
    }

    public constructor(properties: Properties) {
        if (properties.element === undefined) {
            panic()
        } else {
            this.element = properties.element;
            this.touches = new Touches({
                element: properties.element,
                listeners: properties.listeners,
                resize: properties.autoHeight,
                mouseListeners: {
                    mousedown: "handleMousedown",
                    mouseup: "handleMouseup",
                    wheel: "handleWheel",
                },
            });
        }

        if (!this.element) {
            return;
        }

        if (typeof properties.limitZoom === "number") {
            this.maxScale = properties.limitZoom;
        }
        let localElem: Element | null = this.element.querySelector("*");
        if (localElem !== null) {
            this.elementTarget = localElem.tagName;
        } else {
            panic()
        }
        let localHTMLElem: HTMLElement | null = this.element.parentElement;
        if (localHTMLElem !== null) {
            this.parentElement = localHTMLElem;
        } else {
            panic()
        }
        this.properties = Object.assign({}, defaultProperties, properties);
        this.detectLimitZoom();

        /* Init */
        this.setBasicStyles();

        /*
         * Listeners
         */

        this.touches.on("touchstart", this.handleTouchstart);
        this.touches.on("touchend", this.handleTouchend);
        this.touches.on("mousedown", this.handleTouchstart);
        this.touches.on("mouseup", this.handleTouchend);
        this.touches.on("pan", this.handlePan);
        this.touches.on("mousemove", this.handlePan);
        this.touches.on("pinch", this.handlePinch);

        if (this.properties.wheel) {
            this.touches.on("wheel", this.handleWheel);
        }

        if (this.properties.doubleTap) {
            this.touches.on("double-tap", this.handleDoubleTap);
        }

        if (this.properties.autoHeight) {
            this.touches.on("resize", this.handleResize);
        }

        if (this.properties.initialTransform !== undefined) {
            this.scale = this.properties.initialTransform.scale;
            this.moveX = this.properties.initialTransform.moveX === 0
                ? this.properties.initialTransform.moveX
                : this.element.clientWidth 
                    / this.properties.initialTransform.moveX;
            this.moveY = this.properties.initialTransform.moveY === 0
                ? this.properties.initialTransform.moveY
                : this.element.clientHeight 
                    / this.properties.initialTransform.moveY;
            this.updateInitialValues(false);
            this.transformElement(this.properties.transitionDuration ?? 1);
        }
    }

    /* Touchstart */

    private handleTouchstart = (event: TouchEvent | MouseEvent): void => {
        this.touches.addEventListeners("mousemove");
        this.getElementPosition();

        if (this.eventType === undefined) {
            this.getTouchstartPosition(event);
        }
    };

    /* Touchend */

    private handleTouchend = (event: TouchEvent | MouseEvent): void => {
        /* touchend */
        if (event.type === "touchend") {
            const touches = (event as TouchEvent).touches;

            // Min scale
            if (this.scale < 1) {
                this.scale = 1;
            }

            // Auto Zoom Out
            if (this.properties.autoZoomOut && this.eventType === "pinch") {
                this.scale = 1;
            }

            // Align image
            if (
                this.eventType === "pinch" 
                || (this.eventType === "pan" && this.scale > this.minPanScale)
            ) {
                this.alignImage();
            }

            // Update initial values
            if (
                this.eventType === "pinch" ||
                this.eventType === "pan" ||
                this.eventType === "horizontal-swipe" ||
                this.eventType === "vertical-swipe"
            ) {
                this.updateInitialValues();
            }

            this.eventType = "touchend";

            if (touches && touches.length === 0) {
                this.eventType = undefined;
            }
        }

        /* mouseup */
        if (event.type === "mouseup") {
            this.updateInitialValues();
            this.eventType = undefined;
        }

        this.touches.removeEventListeners("mousemove");
    };

    /*
     * Handlers
     */

    private handlePan = (event: TouchEvent | MouseEvent): void => {
        if (this.scale < this.minPanScale || this.properties.disablePan) {
            return;
        }

        event.preventDefault();
        const { clientX, clientY } = this.getClientPosition(event);

        if (!this.eventType) {
            this.startX = clientX - this.elementPosition.left;
            this.startY = clientY - this.elementPosition.top;
        }

        this.eventType = "pan";
        this.moveX = 
            this.initialMoveX + (this.moveLeft(event, 0) - this.startX);
        this.moveY = 
            this.initialMoveY + (this.moveTop(event, 0) - this.startY);

        if (this.properties.limitPan) {
            this.limitPanY();
            this.limitPanX();
        }

        /* mousemove */
        if (event.type === "mousemove" && this.scale > this.minPanScale) {
            this.centeringImage();
        }

        this.transformElement(0);
    };

    private handleDoubleTap = (event: TouchEvent): void => {
        this.toggleZoom(event);
        return;
    };

    private handlePinch = (event: TouchEvent): void => {
        event.preventDefault();

        if (this.eventType === undefined || this.eventType === "pinch") {
            const touches = event.touches;

            if (!this.eventType) {
                this.initialDistance = this.getDistance(touches);

                const moveLeft0 = this.moveLeft(event, 0);
                const moveLeft1 = this.moveLeft(event, 1);
                const moveTop0 = this.moveTop(event, 0);
                const moveTop1 = this.moveTop(event, 1);

                this.moveXC = (moveLeft0 + moveLeft1) / 2 - this.initialMoveX;
                this.moveYC = (moveTop0 + moveTop1) / 2 - this.initialMoveY;
            }

            this.eventType = "pinch";
            this.distance = this.getDistance(touches);
            this.scale = 
                this.initialScale * (this.distance / this.initialDistance);
            this.moveX = 
                this.initialMoveX 
                - (
                    (this.distance / this.initialDistance) 
                    * this.moveXC 
                    - this.moveXC
                );
            this.moveY = 
                this.initialMoveY 
                - (
                    (this.distance / this.initialDistance) 
                    * this.moveYC 
                    - this.moveYC
                );

            this.handleLimitZoom();

            if (this.properties.limitPan) {
                this.limitPanY();
                this.limitPanX();
            }

            this.transformElement(0);
        }
    };

    private handleWheel = (event: WheelEvent): void => {
        event.preventDefault();

        const wheelZoomFactor = this.properties.wheelZoomFactor || 0;
        const zoomFactor = event.deltaY < 0 
            ? wheelZoomFactor 
            : -wheelZoomFactor;
        let newScale = this.initialScale + zoomFactor;

        /* Round value */
        if (newScale < 1 + wheelZoomFactor) {
            newScale = 1;
        } else if (
            newScale < this.maxScale 
            && newScale > this.maxScale - wheelZoomFactor
        ) {
            newScale = this.maxScale;
        }

        if (newScale < 1 || newScale > this.maxScale) {
            return;
        }

        if (newScale === this.scale) {
            return;
        }

        this.getElementPosition();
        this.scale = newScale;

        /* Get cursor position over image */
        const xCenter = 
            event.clientX - this.elementPosition.left - this.initialMoveX;
        const yCenter = 
            event.clientY - this.elementPosition.top - this.initialMoveY;

        this.setZoom({
            scale: newScale,
            center: [xCenter, yCenter],
        });
    };

    private handleResize = (_event: Event): void => {
        this.setAutoHeight();
    };

    private handleLimitZoom(): void {
        const limitZoom = this.maxScale;
        const minScale = this.properties.minScale || 0;

        if (this.scale > limitZoom || this.scale <= minScale) {
            const imageWidth = this.getImageWidth();
            const imageHeight = this.getImageHeight();
            const enlargedImageWidth = imageWidth * this.scale;
            const enlargedImageHeight = imageHeight * this.scale;
            const moveXRatio = 
                this.moveX / (enlargedImageWidth - imageWidth);
            const moveYRatio = 
                this.moveY / (enlargedImageHeight - imageHeight);

            if (this.scale > limitZoom) {
                this.scale = limitZoom;
            }

            if (this.scale <= minScale) {
                this.scale = minScale;
            }

            const newImageWidth = imageWidth * this.scale;
            const newImageHeight = imageHeight * this.scale;

            this.moveX = 
                -Math.abs(moveXRatio * (newImageWidth - imageWidth));
            this.moveY = 
                -Math.abs(-moveYRatio * (newImageHeight - imageHeight));
        }
    }

    private moveLeft(
        event: TouchEvent | MouseEvent, 
        index: number = 0
    ): number {
        const clientX = this.getClientPosition(event, index).clientX;
        return clientX - this.elementPosition.left;
    }

    private moveTop(
        event: TouchEvent | MouseEvent, 
        index: number = 0
    ): number {
        const clientY = this.getClientPosition(event, index).clientY;
        return clientY - this.elementPosition.top;
    }

    /*
     * Detection
     */

    private centeringImage(): boolean {
        const img = this.getImageElement();
        const initialMoveX = this.moveX;
        const initialMoveY = this.moveY;

        if (this.moveY > 0) {
            this.moveY = 0;
        }
        if (this.moveX > 0) {
            this.moveX = 0;
        }

        if (img) {
            this.limitPanY();
            this.limitPanX();
        }
        if (img && this.scale < 1) {
            if (this.moveX < this.element.offsetWidth * (1 - this.scale)) {
                this.moveX = this.element.offsetWidth * (1 - this.scale);
            }
        }

        return initialMoveX !== this.moveX || initialMoveY !== this.moveY;
    }

    private limitPanY(): void {
        const imgHeight = this.getImageHeight();
        const scaledImgHeight = imgHeight * this.scale;
        const parentHeight = this.parentElement.offsetHeight;
        const elementHeight = this.element.offsetHeight;

        if (scaledImgHeight < parentHeight) {
            this.moveY = (parentHeight - elementHeight * this.scale) / 2;
        } else {
            const imgOffsetTop = 
                ((imgHeight - elementHeight) * this.scale) / 2;

            if (this.moveY > imgOffsetTop) {
                this.moveY = imgOffsetTop;
            } else if (
                (
                    scaledImgHeight 
                    + Math.abs(imgOffsetTop) 
                    - parentHeight 
                    + this.moveY
                ) < 0
            ) {
                this.moveY = 
                    -(scaledImgHeight + Math.abs(imgOffsetTop) - parentHeight);
            }
        }
    }

    private limitPanX(): void {
        const imgWidth = this.getImageWidth();
        const scaledImgWidth = imgWidth * this.scale;
        const parentWidth = this.parentElement.offsetWidth;
        const elementWidth = this.element.offsetWidth;

        if (scaledImgWidth < parentWidth) {
            this.moveX = (parentWidth - elementWidth * this.scale) / 2;
        } else {
            const imgOffsetLeft = 
                ((imgWidth - elementWidth) * this.scale) / 2;

            if (this.moveX > imgOffsetLeft) {
                this.moveX = imgOffsetLeft;
            } else if (
                (
                    scaledImgWidth 
                    + Math.abs(imgOffsetLeft) 
                    - parentWidth 
                    + this.moveX
                ) < 0
            ) {
                this.moveX = 
                    -(
                        imgWidth 
                        * this.scale 
                        + Math.abs(imgOffsetLeft) 
                        - parentWidth
                    );
            }
        }
    }

    private setBasicStyles(): void {
        this.element.style.display = "flex";
        this.element.style.alignItems = "center";
        this.element.style.justifyContent = "center";
        this.element.style.transformOrigin = "0 0";
        this.setImageSize();
        this.setDraggableImage();
    }

    private removeBasicStyles(): void {
        this.element.style.display = "";
        this.element.style.alignItems = "";
        this.element.style.justifyContent = "";
        this.element.style.transformOrigin = "";
        this.removeImageSize();
        this.removeDraggableImage();
    }

    private setDraggableImage(): void {
        const imgElement = this.getImageElement();

        if (imgElement) {
            imgElement.draggable = this.properties.draggableImage ?? false;
        }
    }

    private removeDraggableImage(): void {
        const imgElement = this.getImageElement();

        if (imgElement) {
            imgElement.draggable = true;
        }
    }

    private setImageSize(): void {
        const imgElement = this.getImageElements();

        if (imgElement.length) {
            imgElement[0].style.maxWidth = "100%";
            imgElement[0].style.maxHeight = "100%";

            this.setAutoHeight();
        }
    }

    private setAutoHeight(): void {
        const imgElement = this.getImageElements();

        if (!this.properties.autoHeight || !imgElement.length) {
            return;
        }

        const imgNaturalWidth = imgElement[0].getAttribute("width") ?? 0;
        const imgNaturalHeight = imgElement[0].getAttribute("height") ?? 1;
        const sizeRatio = +imgNaturalWidth / +imgNaturalHeight;
        const parentWidth = this.parentElement.offsetWidth;

        imgElement[0].style.maxHeight = parentWidth / sizeRatio + "px";
    }

    private removeImageSize(): void {
        const imgElement = this.getImageElements();

        if (imgElement.length) {
            imgElement[0].style.maxWidth = "";
            imgElement[0].style.maxHeight = "";
        }
    }

    private getElementPosition(): void {
        this.elementPosition = 
            this.element.parentElement!.getBoundingClientRect();
    }

    private getTouchstartPosition(event: TouchEvent | MouseEvent): void {
        const { clientX, clientY } = this.getClientPosition(event);

        this.startX = clientX - this.elementPosition.left;
        this.startY = clientY - this.elementPosition.top;
    }

    private getClientPosition(
        event: TouchEvent | MouseEvent, index: number = 0
    ): { clientX: number; clientY: number } {
        let clientX: number;
        let clientY: number;

        if (event.type === "touchstart" || event.type === "touchmove") {
            clientX = (event as TouchEvent).touches[index].clientX;
            clientY = (event as TouchEvent).touches[index].clientY;
            return {
                clientX,
                clientY,
            };
        }
        if (event.type === "mousedown" || event.type === "mousemove") {
            clientX = (event as MouseEvent).clientX;
            clientY = (event as MouseEvent).clientY;
            return {
                clientX,
                clientY,
            };
        }

        panic()
    }

    private resetScale(): void {
        this.scale = 1;
        this.moveX = 0;
        this.moveY = 0;
        this.updateInitialValues();
        this.transformElement(this.properties.transitionDuration ?? 1);
    }

    private updateInitialValues(triggerEvent: boolean = true): void {
        this.initialScale = this.scale;
        this.initialMoveX = this.moveX;
        this.initialMoveY = this.moveY;
        if (triggerEvent) {
            this.transformChange.next({
                scale: this.initialScale,
                moveX: this.initialMoveX === 0 
                    ? this.initialMoveX 
                    : this.element.clientWidth / this.initialMoveX,
                moveY: this.initialMoveY === 0 
                    ? this.initialMoveY 
                    : this.element.clientHeight / this.initialMoveY
            })
        }
    }

    private getDistance(touches: TouchList): number {
        return Math.sqrt(
            Math.pow(touches[0].pageX - touches[1].pageX, 2) 
            + Math.pow(touches[0].pageY - touches[1].pageY, 2),
        );
    }

    private getImageHeight(): number {
        const img = this.getImageElement() as HTMLImageElement;
        return img.offsetHeight;
    }

    private getImageWidth(): number {
        const img = this.getImageElement() as HTMLImageElement;
        return img.offsetWidth;
    }

    private transformElement(duration: number): void {
        this.element.style.transition = "all " + duration + "ms";
        this.element.style.transform =
            "matrix(" +
            Number(this.scale) +
            ", 0, 0, " +
            Number(this.scale) +
            ", " +
            Number(this.moveX) +
            ", " +
            Number(this.moveY) +
            ")";
    }

    private isTouchScreen(): boolean {
        const prefixes = " -webkit- -moz- -o- -ms- ".split(" ");

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
        return this.getMatchMedia(query);
    }

    private getMatchMedia(query: string): boolean {
        return window.matchMedia(query).matches;
    }

    public isDragging(): boolean {
        if (this.properties.disablePan) {
            return false;
        }

        const imgHeight = this.getImageHeight();
        const imgWidth = this.getImageWidth();

        if (this.scale > 1) {
            return (
                imgHeight * this.scale > this.parentElement.offsetHeight ||
                imgWidth * this.scale > this.parentElement.offsetWidth
            );
        }
        if (this.scale === 1) {
            return imgHeight > this.parentElement.offsetHeight 
                || imgWidth > this.parentElement.offsetWidth;
        }

        panic();
    }

    public detectLimitZoom(): void {
        // Assign to default only if it is not passed through constructor
        this.maxScale ??= this.defaultMaxScale;

        if (
            this.properties.limitZoom === "original image size" 
            && this.elementTarget === "IMG"
        ) {
            // We are waiting for the element with the image to be available
            this.pollLimitZoomForOriginalImage();
        }
    }

    private pollLimitZoomForOriginalImage(): void {
        const poll = setInterval(() => {
            const maxScaleForOriginalImage = 
                this.getMaxScaleForOriginalImage();
            if (typeof maxScaleForOriginalImage === "number") {
                this.maxScale = maxScaleForOriginalImage;
                clearInterval(poll);
            }
        }, 10);
    }

    private getMaxScaleForOriginalImage(): number {
        let maxScale!: number;
        const img = this.element.getElementsByTagName("img")[0];

        if (img.naturalWidth && img.offsetWidth) {
            maxScale = img.naturalWidth / img.offsetWidth;
        }

        return maxScale;
    }

    private getImageElement(): HTMLElement {
        const imgElement = 
            this.element.getElementsByTagName(this.elementTarget);

        if (imgElement.length) {
            return imgElement[0] as HTMLElement;
        } else {
            panic();
        }
    }

    private getImageElements(): HTMLCollectionOf<HTMLElement> {
        return this.element.getElementsByTagName(
            this.elementTarget
        ) as HTMLCollectionOf<HTMLElement>;
    }

    public toggleZoom(event: TouchEvent | boolean = false): void {
        if (this.initialScale === 1) {
            if (event && (event as TouchEvent).changedTouches) {
                if (this.properties.doubleTapScale === undefined) {
                    return;
                }

                const changedTouches = (event as TouchEvent).changedTouches;
                this.scale = 
                    this.initialScale * this.properties.doubleTapScale;
                this.moveX =
                    this.initialMoveX 
                    - (
                        changedTouches[0].clientX 
                        - this.elementPosition.left
                    ) 
                    * (this.properties.doubleTapScale - 1);
                this.moveY =
                    this.initialMoveY 
                    - (
                        changedTouches[0].clientY 
                        - this.elementPosition.top
                    ) 
                    * (this.properties.doubleTapScale - 1);
            } else {
                const zoomControlScale = 
                    this.properties.zoomControlScale || 0;
                this.scale = 
                    this.initialScale * (zoomControlScale + 1);
                this.moveX = 
                    this.initialMoveX 
                    - (this.element.offsetWidth * (this.scale - 1)) 
                    / 2;
                this.moveY = 
                    this.initialMoveY 
                    - (this.element.offsetHeight * (this.scale - 1)) 
                    / 2;
            }

            this.centeringImage();
            this.updateInitialValues();
            this.transformElement(this.properties.transitionDuration ?? 1);
        } else {
            this.resetScale();
        }
    }

    private setZoom(properties: { scale: number; center?: number[] }): void {
        this.scale = properties.scale;

        let xCenter;
        let yCenter;
        const visibleAreaWidth = this.element.offsetWidth;
        const visibleAreaHeight = this.element.offsetHeight;
        const scalingPercent = 
            (visibleAreaWidth * this.scale) 
            / (visibleAreaWidth * this.initialScale);

        if (properties.center) {
            xCenter = properties.center[0];
            yCenter = properties.center[1];
        } else {
            xCenter = visibleAreaWidth / 2 - this.initialMoveX;
            yCenter = visibleAreaHeight / 2 - this.initialMoveY;
        }

        this.moveX = 
            this.initialMoveX - (scalingPercent * xCenter - xCenter);
        this.moveY = 
            this.initialMoveY - (scalingPercent * yCenter - yCenter);

        this.centeringImage();
        this.updateInitialValues();
        this.transformElement(this.properties.transitionDuration ?? 1);
    }

    private alignImage(): void {
        const isMoveChanged = this.centeringImage();

        if (isMoveChanged) {
            this.updateInitialValues();
            this.transformElement(this.properties.transitionDuration ?? 1);
        }
    }

    public destroy(): void {
        this.removeBasicStyles();
        this.touches.destroy();
    }

    private getPropertiesValue<K extends keyof Properties>(
        propertyName: K
    ): Properties[K] {
        if (this.properties && this.properties[propertyName]) {
            return this.properties[propertyName];
        } else {
            return defaultProperties[propertyName];
        }
    }
}
