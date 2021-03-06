import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as cheerio from "cheerio";
import { Observable, ReplaySubject } from "rxjs";

import { map } from "rxjs/operators";
import { Run, RunDetails } from "../models";
import { UserService, ConstantsService } from "../services";

@Injectable()
export class RunService {
    private lastUserId: number;
    private lastRuns$: ReplaySubject<Run[]> = new ReplaySubject(1);

    constructor(private http: HttpClient, private userService: UserService, private constantsService: ConstantsService) { }

    getByCurrentUser(): Observable<Run[]> {
        if (this.lastUserId !== this.userService.currentUserId) {
            console.log("Getting runs ...");
            this.lastUserId = this.userService.currentUserId;
            this.http.get(
                this.constantsService.runsUrl + this.userService.currentUserId,
                { responseType: "text" })
                .pipe(
                    map(response => {
                        const runs: Array<Run> = new Array<Run>();

                        const content = response;

                        const options = {
                            normalizeWhitespace: true,
                            xmlMode: true,
                        };

                        const webPage = cheerio.load(content, options);
                        const rows = webPage("table tbody tr");

                        rows.each((index, elem) => {
                            const cells = elem.children.filter(c => c.type === "tag" && c.name === "td");
                            if (cells.length === 9) {
                                runs.push(this.extractRun(cells));
                            }
                        });

                        return runs.sort((a, b) => b.date - a.date);
                    })
                ).subscribe(runs => {
                    this.lastRuns$.next(runs);
                });
        }

        return this.lastRuns$;
    }

    public getRunDetails(runId: string): Observable<RunDetails> {
        return this.http.get(
            this.constantsService.userUrl + this.userService.currentUserId,
            { responseType: "text" })
            .pipe(
                map(response => {

                    console.log("get details ...");
                    const content = response;

                    const options = {
                        normalizeWhitespace: true,
                        xmlMode: true
                    };

                    const webPage = cheerio.load(content, options);
                    const rows = webPage(".accordion table tbody tr");

                    let result = null;

                    rows.each((index, elem) => {
                        const cells = elem.children.filter(c => c.type == "tag" && c.name == "td");
                        const rDetails = this.extractRunDetails(cells);

                        if (rDetails != null && rDetails.id == runId && result == null) {
                            result = rDetails.runDetails;
                        }
                    });

                    return result;
                })
            );
    }

    private extractRunDetails(cells: any): Run {
        const run = new Run(
            this.extractDate(cells[2]),
            this.extractTime(cells[4]),
            this.extractPlace(cells[0]),
            "", "", 0, "", "", ""
        );

        const runDetails = new RunDetails();
        runDetails.eventId = this.extractEventId(cells[1]);
        run.runDetails = runDetails;
        return run;
    }

    private extractEventId(cell: any): string {
        const strMatch = cell.children[0].attribs.href.match(/^results\.php\?event=([0-9]*)$/);
        return strMatch[1];
    }

    private extractRun(cells: any): Run {
        return new Run(
            this.extractDate(cells[1]),
            this.extractTime(cells[3]),
            this.extractPlace(cells[0]),
            this.extractDifferenceToLast(cells[4]),
            this.extractDifferenceToBest(cells[5]),
            this.extractPosition(cells[2]),
            this.extractSpeed(cells[6]),
            this.extractNotes(cells[8]),
            this.extractPace(cells[7])
        );
    }

    private extractDate(cell: any): number {
        const strMatch = cell.children[0].data.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        return new Date(strMatch[3], strMatch[2] - 1, strMatch[1]).getTime();
    }

    private extractPlace(cell: any): string {
        return cell.children[0].data;
    }

    private extractTime(cell: any): string {
        return cell.children[0].data;
    }

    private extractDifferenceToLast(cell: any): string {
        if (cell.children[0].data == null || cell.children[0].data == undefined) {
            return cell.children[0].children[0].data;
        } else {
            return cell.children[0].data;
        }
    }

    private extractPosition(cell: any): number {
        return +cell.children[0].data;
    }

    private extractDifferenceToBest(cell: any): string {
        if (cell.children[0].data == null || cell.children[0].data == undefined) {
            return cell.children[0].children[0].data;
        } else {
            return cell.children[0].data;
        }
    }

    private extractSpeed(cell: any): string {
        const untrimmedSpeed = cell.children[0].data;
        return untrimmedSpeed.substring(0, untrimmedSpeed.length - 5);
    }

    private extractNotes(cell: any): string {
        if (cell.children[0].children[0].data == undefined) {
            return cell.children[0].children[0].children[0].data;
        } else {
            return cell.children[0].children[0].data;
        }
    }

    private extractPace(cell: any): string {
        return cell.children[0].data;
    }
}
