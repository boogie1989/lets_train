import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: const Scaffold(
        backgroundColor: Colors.transparent,
        body: MyScreen(),
      ),
      builder: (_, child) => ScreenBackground(
        child: child ?? const Offstage(),
      ),
    );
  }
}

class MyScreen extends StatelessWidget {
  const MyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final breakpoint = switch (MediaQuery.sizeOf(context).width) {
      > 600 && < 1200 => 1,
      > 1200 => 2,
      _ => 0,
    };

    final borderColor = switch (breakpoint) {
      1 => Colors.yellow,
      2 => Colors.green,
      _ => Colors.red,
    };

    Widget body = DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: borderColor),
      ),
      child: const Center(
        child: Text(
          'Hello World!',
          style: TextStyle(
            color: Colors.white,
          ),
        ),
      ),
    );

    if (breakpoint != 0) {
      body = Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: 600,
          ),
          child: body,
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: body,
    );
  }
}
