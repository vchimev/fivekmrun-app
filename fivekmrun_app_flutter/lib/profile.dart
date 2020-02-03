import 'package:fivekmrun_flutter/common/avatar.dart';
import 'package:fivekmrun_flutter/common/run_card.dart';
import 'package:fivekmrun_flutter/state/run_model.dart';
import 'package:fivekmrun_flutter/state/runs_resource.dart';
import 'package:fivekmrun_flutter/state/user_resource.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:charts_flutter/flutter.dart' as charts;

import 'common/milestone.dart';

class ProfileDashboard extends StatelessWidget {
  const ProfileDashboard({Key key}) : super(key: key);

  int nextRunsMilestone(int count) {
    if (count <= 50) {
      return 50;
    } else if (count <= 100) {
      return 100;
    } else if (count <= 250) {
      return 250;
    } else {
      return 500;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<UserResource>(builder: (context, userResource, child) {
      final user = userResource?.value;
      final textTheme = Theme.of(context).textTheme;
      final runsResource = Provider.of<RunsResource>(context);
      final logout = () {
        userResource.reset();
        Navigator.of(context, rootNavigator: true).pushNamedAndRemoveUntil("/", (_) => false);
      };
      return ListView(
        children: <Widget>[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                flex: 2,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    IconButton(
                      icon: Icon(Icons.line_weight),
                      onPressed: () {},
                    ),
                    MilestoneTile(
                        value: user?.totalKmRan?.toInt() ?? 0,
                        milestone: 1250,
                        title: "Пробягано\nразстояние"),
                  ],
                ),
              ),
              Expanded(
                flex: 3,
                child: Column(
                  children: <Widget>[
                    Hero(tag: "avatar", child: Avatar(url: user?.avatarUrl)),
                    Text(
                      user?.name ?? "",
                      style: textTheme.body2,
                      textAlign: TextAlign.center,
                    ),
                    Text("${user?.age ?? ""}г."),
                    Text("${user?.suuntoPoints ?? ""} SUUNTO точки"),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: Column(
                  children: <Widget>[
                    IconButton(
                      icon: const Icon(Icons.exit_to_app),
                      onPressed: logout,
                    ),
                    MilestoneTile(
                        value: user?.runsCount ?? 0,
                        milestone: nextRunsMilestone(user?.runsCount ?? 0),
                        title: "Следаваща\nцел"),
                  ],
                ),
              ),
            ],
          ),
          Row(
            children: <Widget>[
              Expanded(
                child: RunCard(
                  title: "Последно уастие",
                  run: runsResource.lastRun,
                ),
              ),
              Expanded(
                child: RunCard(
                  title: "Най-добро уастие",
                  run: runsResource.bestRun,
                ),
              ),
            ],
          ),
          if (runsResource.value != null)
            Card(
              child: Container(
                height: 200,
                child: RunsChart.withRuns(runsResource?.value),
              ),
            ),
        ],
      );
    });
  }
}

class RunsChart extends StatelessWidget {
  final List<charts.Series> seriesList;
  final bool animate;

  RunsChart(this.seriesList, {this.animate});

  /// Creates a [TimeSeriesChart] with sample data and no transition.
  factory RunsChart.withRuns(List<Run> runs) {
    return new RunsChart(
      _createData(runs),
    );
  }

  @override
  Widget build(BuildContext context) {
    return new charts.TimeSeriesChart(seriesList, animate: animate, behaviors: [
      // Optional - Configures a [LinePointHighlighter] behavior with a
      // vertical follow line. A vertical follow line is included by
      // default, but is shown here as an example configuration.
      //
      // By default, the line has default dash pattern of [1,3]. This can be
      // set by providing a [dashPattern] or it can be turned off by passing in
      // an empty list. An empty list is necessary because passing in a null
      // value will be treated the same as not passing in a value at all.
      new charts.LinePointHighlighter(
          showHorizontalFollowLine:
              charts.LinePointHighlighterFollowLineType.none,
          showVerticalFollowLine:
              charts.LinePointHighlighterFollowLineType.nearest),
      // Optional - By default, select nearest is configured to trigger
      // with tap so that a user can have pan/zoom behavior and line point
      // highlighter. Changing the trigger to tap and drag allows the
      // highlighter to follow the dragging gesture but it is not
      // recommended to be used when pan/zoom behavior is enabled.
      new charts.SelectNearest(eventTrigger: charts.SelectionTrigger.tapAndDrag)
    ]);
  }

  /// Create one series with sample hard coded data.
  static List<charts.Series<Run, DateTime>> _createData(List<Run> runs) {
    return [
      new charts.Series<Run, DateTime>(
        id: 'Runs',
        // colorFn: (_, __) => charts.MaterialPalette.blue.shadeDefault,
        domainFn: (Run run, _) => run.date,
        measureFn: (Run run, _) => run.timeInSeconds,
        data: runs,
      )
    ];
  }
}
