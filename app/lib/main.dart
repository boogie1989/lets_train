import 'package:flutter/material.dart';
import 'package:ui_kit/ui_kit.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: ScreenBackground(
        type: ScreenBackgroundType.shader,
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: Center(
            child: Text('Hello World!'),
          ),
        ),
      ),
    );
  }
}
