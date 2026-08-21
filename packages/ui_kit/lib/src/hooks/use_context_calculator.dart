import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

T useScreenSizeCalculator<T>(T Function(Size screenSize) calculate) {
  return use(_BreakpointHook(calculate));
}

class _BreakpointHook<T> extends Hook<T> {
  const _BreakpointHook(this.calculate);

  final T Function(Size screenSize) calculate;

  @override
  _BreakpointHookState<T> createState() => _BreakpointHookState<T>();
}

class _BreakpointHookState<T> extends HookState<T, _BreakpointHook<T>>
    with WidgetsBindingObserver {
  late Size screenSize = getScreenSize();
  late T value = hook.calculate(screenSize);

  late FlutterView view = View.of(context);
  late MediaQueryData mq = MediaQueryData.fromView(view);

  @override
  void initHook() {
    super.initHook();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeMetrics() {
    final nextSize = getScreenSize();
    if (nextSize != screenSize) {
      final nextValue = hook.calculate(
        screenSize = nextSize,
      );

      if (value != nextValue) {
        setState(() {
          value = nextValue;
        });
      }
    }
  }

  Size getScreenSize() {
    return view.physicalSize / view.devicePixelRatio;
  }

  @override
  T build(BuildContext context) {
    view = View.of(context);

    return value;
  }

  @override
  Object? get debugValue => value;

  @override
  String get debugLabel => 'useBreakpoint';
}
