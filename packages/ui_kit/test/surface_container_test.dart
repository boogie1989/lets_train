import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ui_kit/ui_kit.dart';

void main() {
  Widget stage(ThemeData Function(BuildContext) createTheme) {
    return MaterialApp(
      home: Builder(
        builder: (context) => Theme(
          data: createTheme(context),
          child: ScreenBackground(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (final level in SurfaceLevel.values)
                  SurfaceContainer(
                    level: level,
                    padding: const EdgeInsets.all(16),
                    child: Text('level: ${level.name}'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  testWidgets('SurfaceContainer renders every level over ScreenBackground '
      'in both themes', (tester) async {
    for (final createTheme in [createDarkTheme, createLightTheme]) {
      await tester.pumpWidget(stage(createTheme));
      // Let FragmentProgram.fromAsset complete so the shader paths
      // (smoke glass + background) actually paint.
      await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 50)),
      );
      // A few animation frames.
      await tester.pump(const Duration(milliseconds: 32));
      await tester.pump(const Duration(milliseconds: 32));

      expect(find.byType(SurfaceContainer), findsNWidgets(3));
      expect(tester.takeException(), isNull);
    }

    // Unmount so the background ticker is disposed before the test ends.
    await tester.pumpWidget(const SizedBox());
  });
}
