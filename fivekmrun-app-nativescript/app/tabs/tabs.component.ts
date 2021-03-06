import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { NavigationService } from "../services/navigation.service";
import { BottomNavigation } from "tns-core-modules/ui/bottom-navigation";

@Component({
    moduleId: module.id,
    selector: "tabs-page",
    templateUrl: "./tabs.component.html"
})
export class TabsComponent implements OnInit, AfterViewInit {
    @ViewChild("tabView", { static: true })
    tabElementRef: ElementRef<BottomNavigation>;
    selectedIndex: number = 1;

    constructor(
        private routerExtension: RouterExtensions,
        private activeRoute: ActivatedRoute,
        private navService: NavigationService,
    ) {
    }

    ngOnInit() {
        this.routerExtension.navigate([{
            outlets: {
                homeTab: ["home"],
                runsTab: ["runs"],
                eventsTab: ["future-events"],
                resultsTab: ["results"],
                donationTab: ["donation"]
            }
        }], { relativeTo: this.activeRoute });
    }


    ngAfterViewInit() {
        this.navService.initTabView(this.tabElementRef.nativeElement);
    }
}
