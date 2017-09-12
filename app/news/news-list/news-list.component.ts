import { Component, OnInit, ViewChild } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-telerik-ui-pro/sidedrawer";
import { RadSideDrawerComponent } from "nativescript-telerik-ui-pro/sidedrawer/angular";
import { Observable } from "rxjs/Observable";
import { NewsService } from "../../services";
import { News } from "../../models";
var utilityModule = require("utils/utils");

@Component({
    selector: "NewsList",
    moduleId: module.id,
    templateUrl: "./news-list.component.html"
})
export class NewsListComponent implements OnInit {
    /* ***********************************************************
    * Use the @ViewChild decorator to get a reference to the drawer component.
    * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
    *************************************************************/
    @ViewChild("drawer") drawerComponent: RadSideDrawerComponent;

    private _sideDrawerTransition: DrawerTransitionBase;
    news$: Observable<News[]>;

    constructor(private newsService: NewsService) {}

    /* ***********************************************************
    * Use the sideDrawerTransition property to change the open/close animation of the drawer.
    *************************************************************/
    ngOnInit(): void {
        this._sideDrawerTransition = new SlideInOnTopTransition();
        this.news$ = this.newsService.getAll();
    }

    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    /* ***********************************************************
    * According to guidelines, if you have a drawer on your page, you should always
    * have a button that opens it. Use the showDrawer() function to open the app drawer section.
    *************************************************************/
    onDrawerButtonTap(): void {
        this.drawerComponent.sideDrawer.showDrawer();
    }

    openUrl(url: string): void {
        utilityModule.openUrl(url);
    }
}