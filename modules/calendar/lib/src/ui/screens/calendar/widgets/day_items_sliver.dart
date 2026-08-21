import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

class DayItemsSliver extends StatelessWidget {
  const DayItemsSliver({super.key});

  @override
  Widget build(BuildContext context) {
    return SliverCrossAxisGroup(
      slivers: [
        SliverCrossAxisExpanded(
          flex: 15,
          sliver: SliverList.separated(
            itemBuilder: (context, index) => ListTileBase(
              title: Text('Some Title: $index'),
            ),
            separatorBuilder: (context, index) => const SizedBox(
              height: 32,
            ),
            itemCount: 25,
          ),
        ),
      ],
    );
  }
}
