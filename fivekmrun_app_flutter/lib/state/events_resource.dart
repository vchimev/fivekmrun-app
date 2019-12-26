import 'package:fivekmrun_flutter/state/event_model.dart';
import 'package:fivekmrun_flutter/state/resource.dart';
import 'package:fivekmrun_flutter/constants.dart' as constants;
import 'package:html/dom.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

abstract class EventsResource extends Resource<List<Event>> {
  static final DateFormat inputDateFromat = DateFormat("dd/MM/yyyy");

  List<Event> parseEvents(Document doc, [int topNWeeks = 0]) {
    List<Event> events = List<Event>();
    Iterable<Element> rows = doc.querySelectorAll("div.table-responsive table tr");

    if (topNWeeks > 0) {
      rows = rows.take(topNWeeks);
    }

    rows.forEach((row) {
      final cells = row.getElementsByTagName("td");
      DateTime date;
      if (cells.length > 0) {
        String str = cells.first.text;
        str = str.substring(str.length - 10);
        try {
          date = inputDateFromat.parse(str);
        } on FormatException catch (_) {
          return;
        }
      }

      cells.skip(1).forEach((cell) {
        final links = cell.querySelectorAll("a");
        links.forEach((link) {
          if (link.children.length >= 2) {
            events.add(Event(
                date: date,
                title: link.children[0].text,
                imageUrl: expandRelativeUrl(link.children[1].attributes["src"]),
                location: link.children[2].text,
                detailsUrl: expandRelativeUrl(link.attributes["href"])));
          }
        });
      });
    });

    return events;
  }

  String expandRelativeUrl(String url) {
    if (!url.startsWith("http")) {
      url = constants.baseUrl + url;
    }
    return url;
  }
}

class FutureEventsResource extends EventsResource {
  @override
  Future<http.Response> fetch(int id) {
    return http.get("${constants.futureEventsUrl}");
  }

  @override
  List<Event> parse(Document doc) {
    return this.parseEvents(doc);
  }
}

class PastEventsResource extends EventsResource {
  @override
  Future<http.Response> fetch(int id) {
    return http.get("${constants.pastEventsUrl}");
  }

  @override
  List<Event> parse(Document doc) {
    return this.parseEvents(doc, 4);
  }
}