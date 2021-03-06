import { Component, OnInit, Input } from "@angular/core";
import { User } from "../../../models";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { registerElement } from "nativescript-angular/element-registry";
import { ContentView } from "tns-core-modules/ui/page/page";

registerElement("next-milestone-tile", () => { return ContentView })
@Component({
    selector: "next-milestone-tile",
    moduleId: module.id,
    templateUrl: "./next-milestone-tile.component.html"
})
export class NextMilestoneTileComponent implements OnInit {
    @Input() currentUser$: Observable<User>;
    nextMilestone: number = 0;
    currentRuns: number = 0;

    ngOnInit(): void {
        this.currentUser$.pipe(tap(user => {
            if (user.runsCount <= 50) {
                this.nextMilestone = 50;
            } else if (user.runsCount <= 100) {
                this.nextMilestone = 100;
            } else if (user.runsCount <= 250) {
                this.nextMilestone = 250;
            } else {
                this.nextMilestone = 500;
            }

            this.currentRuns = user.runsCount;
        })).subscribe();
    }
}
