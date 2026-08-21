import 'package:calendar/src/ui/screens/calendar/widgets/day_items_sliver.dart';
import 'package:calendar/src/ui/screens/calendar/widgets/day_stats_sliver.dart';
import 'package:calendar/src/ui/screens/calendar/widgets/full_app_bar.dart';
import 'package:calendar/src/ui/screens/calendar/widgets/how_are_you_sliver.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:ui_kit/ui_kit.dart';

class CalendarScreen extends HookWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dimensions = context.dimensions;

    return UiScaffold(
      body: .slivers(
        [
          const FullAppBar(),
          SliverPadding(
            padding: PaddingValues(
              horizontal: dimensions.space4,
              top: dimensions.space8,
            ),
            sliver: const HowAreYouSliver(),
          ),
          SliverPadding(
            padding: PaddingValues(
              top: dimensions.space4,
              horizontal: dimensions.space4,
            ),
            sliver: const DayStatsSliver(),
          ),
          SliverPadding(
            padding: PaddingValues(
              top: dimensions.space4,
              bottom: dimensions.space16,
              horizontal: dimensions.space4,
            ),
            sliver: const DayItemsSliver(),
          ),
        ],
      ),
    );
  }
}
