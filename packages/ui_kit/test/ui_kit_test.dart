import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/ui_kit.dart';

void main() {
  testWidgets('ScreenBackground renders its child over each variant',
      (tester) async {
    for (final type in ScreenBackgroundType.values) {
      await tester.pumpWidget(
        MaterialApp(
          home: ScreenBackground(
            type: type,
            child: const Text('content'),
          ),
        ),
      );
      expect(find.text('content'), findsOneWidget);
    }
  });
}
