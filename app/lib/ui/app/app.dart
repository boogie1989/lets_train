import 'package:app/ui/router/router.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:ui_kit/ui_kit.dart';

class LetsApp extends StatefulHookConsumerWidget {
  const LetsApp({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _LetsAppState();
}

class _LetsAppState extends ConsumerState<LetsApp> {
  final router = AppRouter();

  @override
  Widget build(BuildContext context) {
    final breakpoint = useBreakpoint();

    return MaterialApp.router(
      key: const ValueKey('lets_app'),
      routerConfig: router.config(),
      themeMode: ThemeMode.dark,
      theme: createLightTheme(
        context,
        breakpoint: breakpoint,
      ),
      darkTheme: createDarkTheme(
        context,
        breakpoint: breakpoint,
      ),
    );
  }
}
