import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

class DayStatsSliver extends StatelessWidget {
  const DayStatsSliver({super.key});

  @override
  Widget build(BuildContext context) {
    return const SliverToBoxAdapter(
      child: SurfaceContainer(
        child: SizedBox(
          height: 200,
        ),
      ),
    );
  }
}
