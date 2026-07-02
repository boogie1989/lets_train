import 'package:flutter/material.dart';
import 'package:flutter/widget_previews.dart';
import 'package:ui_kit/src/containers/screen_background/screen_background.dart';
import 'package:ui_kit/src/containers/surface_container/surface_container.dart';
import 'package:ui_kit/src/theme/theme.dart';

@Preview(name: 'SurfaceContainer · dark', size: Size(430, 560))
Widget surfaceContainerDarkPreview() => Builder(
  builder: (context) => Theme(
    data: createDarkTheme(context),
    child: const _SurfaceContainerStage(),
  ),
);

@Preview(name: 'SurfaceContainer · light', size: Size(430, 560))
Widget surfaceContainerLightPreview() => Builder(
  builder: (context) => Theme(
    data: createLightTheme(context),
    child: const _SurfaceContainerStage(),
  ),
);

/// The three elevation levels over the smoke background, mirroring the
/// "Containers" section of the design playbook's UiKit page.
class _SurfaceContainerStage extends StatelessWidget {
  const _SurfaceContainerStage();

  @override
  Widget build(BuildContext context) {
    final textTheme = context.theme.textTheme;
    return ScreenBackground(
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final level in SurfaceLevel.values) ...[
              SurfaceContainer(
                level: level,
                padding: const EdgeInsets.symmetric(
                  horizontal: 28,
                  vertical: 24,
                ),
                child: SizedBox(
                  width: 240,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('SurfaceContainer', style: textTheme.titleMedium),
                      const SizedBox(height: 4),
                      Text(
                        'level: ${level.name}',
                        style: textTheme.bodySmall?.copyWith(
                          color: context.theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (level != SurfaceLevel.values.last) const SizedBox(height: 24),
            ],
          ],
        ),
      ),
    );
  }
}
