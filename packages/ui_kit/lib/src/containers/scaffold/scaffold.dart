library;

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:ui_kit/src/containers/screen_background/screen_background.dart';

part 'scaffold_params.dart';

class UiScaffold extends HookWidget {
  const UiScaffold({
    super.key,
    this.appBar,
    this.body,
  });

  final PreferredSizeWidget? appBar;
  final UiBodySelector? body;

  @override
  Widget build(BuildContext context) {
    Widget? body = switch (this.body) {
      final UiScaffoldChild c => c.child,
      final UiScaffoldSlivers s => CustomScrollView(
        slivers: s.slivers,
      ),
      _ => null,
    };

    return ScreenBackground(
      child: Scaffold(
        appBar: appBar,
        body: body,
      ),
    );
  }
}
