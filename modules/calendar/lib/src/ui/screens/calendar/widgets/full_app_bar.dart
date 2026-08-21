import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

class FullAppBar extends StatelessWidget {
  const FullAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return SliverFloatingHeader(
      child: SurfaceContainer(
        level: SurfaceLevel.high,
        borderRadius: BorderRadius.zero,
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: 400),
          child: Column(
            children: [
              AppBar(
                title: const Text('Calendar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
