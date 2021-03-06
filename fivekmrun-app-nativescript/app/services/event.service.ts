import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as cheerio from "cheerio";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Event, Result } from "../models";
import { ConstantsService } from "../services";

@Injectable()
export class EventService {

    constructor(private http: HttpClient, private constantsService: ConstantsService) { }

    getAllPastEvents(): Observable<Event[]> {
        return this.http.get(this.constantsService.pastEventsUrl, { responseType: "text" }).pipe(
            map(response => {
                return this.parseEventsResponse(response, 4);
            })
        );
    }

    getResultsDetailsById(eventId: string): Observable<Result[]> {
        return this.getResultsDetails(this.constantsService.resultsUrl + eventId + "&type=1");
    }

    getAllFutureEvents(): Observable<Event[]> {
        return this.http.get(this.constantsService.futureEventsUrl, { responseType: "text" }).pipe(
            map(response => {
                return this.parseEventsResponse(response);
            })
        );
    }

    getResultsDetails(eventDetailUrl: string): Observable<Result[]> {
        return this.http.get(eventDetailUrl, { responseType: "text" }).pipe(
            map(response => {
                return this.parseResultsDetails(response);
            })
        );
    }

    private parseResultsDetails(response: string): Result[] {
        const results = Array<Result>();

        const options = {
            normalizeWhitespace: true,
            xmlMode: true
        };

        const webPage = cheerio.load(response, options);
        const rows = webPage("div.table-responsive1 table tbody tr");

        rows.each((index, row) => {
            let name: string;
            if (!row.children[5].children[0].data) {
                name = row.children[5].children[0].children[0].data;
            } else {
                name = row.children[5].children[0].data;
            }
            const time = row.children[7].children[0].data;
            const position = row.children[1].children[0].data;

            results.push(new Result(name, time, position));
        });

        return results;
    }

    private parseEventsResponse(response: string, topNWeeks: number = 0): Event[] {
        const events = Array<Event>();

        const options = {
            normalizeWhitespace: true,
            xmlMode: true
        };

        const webPage = cheerio.load(response, options);
        const rows = webPage("div.table-responsive table tr");

        if (topNWeeks > 0) {
            rows.splice(topNWeeks, rows.length - topNWeeks);
        }

        rows.each((index, row) => {
            const cells = row.children.filter(c => c.type === "tag" && c.name === "td");
            let date: Date;
            for (let i = 0; i < cells.length; ++i) {
                if (i === 0) {
                    if (cells[0].children[1] !== undefined) {
                        const parts = cells[0].children[1].children[0].data.match(/(\d+)/g);
                        date = new Date(parts[2], parts[1] - 1, parts[0]);
                    } else {
                        break;
                    }
                } else {
                    this.parseCell(cells[i].children[1], date, events);
                    this.parseCell(cells[i].children[3], date, events);
                }
            }
        });

        return events;
    }

    private parseCell(cell: any, date: Date, events: Array<Event>) {
        if (cell && cell.type === "tag" && cell.name === "a") {
            const title = this.parseTitle(cell);
            const imageUrl = this.parseImageUrl(cell);
            const link = this.parseLink(cell);
            const location = this.parseLocation(cell);

            events.push(new Event(title, date, imageUrl, location, link));
        }
    }

    private parseLink(cell: any): string {
        let url = cell.attribs["href"];
        if (!url.startsWith("http")) {
            url = this.constantsService.baseUrl + url;
        }

        return url;
    }

    private parseLocation(cell: any): string {
        return cell.children[3].children[1].children[0].data;
    }

    private parseImageUrl(cell: any): string {
        let imageUrl = cell.children[3].attribs.src;
        if (!imageUrl.startsWith("http")) {
            imageUrl = this.constantsService.baseUrl + imageUrl;
        }

        return imageUrl;
    }

    private parseTitle(cell: any): string {
        if (cell.children[1].children[0]) {
            return cell.children[1].children[0].data;
        } else {
            return "";
        }
    }
}
