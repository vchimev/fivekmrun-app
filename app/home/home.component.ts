import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";

import { Ratings } from "nativescript-ratings";
import { Page } from "tns-core-modules/ui/page/page";

import { Run, User } from "../models";
import { RunService, UserService } from "../services";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    currentUser$: Observable<User>;
    lastRun$: Observable<Run>;
    bestRun$: Observable<Run>;
    runs$: Observable<Run[]>;
    constructor(private userService: UserService, private runService: RunService, private page: Page) {
        this.page.actionBarHidden = true;
    }

    ngOnInit(): void {
        this.currentUser$ = this.userService.getCurrentUser();

        const runs$ = this.runService.getByCurrentUser();

        this.runs$ = runs$.pipe(map(runs => runs.reverse()));
        this.lastRun$ = runs$.pipe(map(runs => runs.length ? runs.reduce((a, b) => (getTime(a) - getTime(b)) > 0 ? a : b) : null));
        this.bestRun$ = runs$.pipe(map(runs => runs.length ? runs.reduce((a, b) => a.time.localeCompare(b.time) < 0 ? a : b) : null));

        this.initializeRatingPlugin();
    }



    private initializeRatingPlugin() {
        const ratings = new Ratings({
            id: "bg.5kmpark.5kmrun",
            showOnCount: 5,
            title: "Харесвате ли приложението?",
            text: "Помогнете ни да го направим още по-добро, като оставите вашето мнение",
            agreeButtonText: "Да, разбира се",
            remindButtonText: "Напомни ми по-късно",
            declineButtonText: "Не, благодаря",
            iTunesAppId: "1299888204"
        });

        ratings.init();
        ratings.prompt();
    }
}

function getTime(run?: Run) {
    return (run && run.date) ? run.date.getTime() : 0;
}