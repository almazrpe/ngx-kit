import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StatusCircleComponent } from "./status-circle.component";

describe("StatusCircleComponent", () => {
    let component: StatusCircleComponent;
    let fixture: ComponentFixture<StatusCircleComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ StatusCircleComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StatusCircleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
