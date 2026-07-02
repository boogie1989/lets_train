library;

import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

part 'breakpoint.dart';

Breakpoint useBreakpoint() {
  return use(const _BreakpointHook());
}

class _BreakpointHook extends Hook<Breakpoint> {
  const _BreakpointHook();

  @override
  _BreakpointHookState createState() => _BreakpointHookState();
}

class _BreakpointHookState extends HookState<Breakpoint, _BreakpointHook>
    with WidgetsBindingObserver {
  late Breakpoint _breakpoint = _measure() ?? Breakpoint.small;

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

  /// Fires (without any [BuildContext]) whenever the view metrics change —
  /// resize, rotation, keyboard insets, display change.
  @override
  void didChangeMetrics() {
    final next = _measure();
    if (next != null && next != _breakpoint) {
      setState(() => _breakpoint = next);
    }
  }

  /// Reads the logical width straight from the [FlutterView] (physical size ÷
  /// device pixel ratio) instead of `MediaQuery`, so no context is needed.
  /// Returns `null` when there is no implicit view yet.
  Breakpoint? _measure() {
    final view = WidgetsBinding.instance.platformDispatcher.implicitView;
    if (view == null) return null;
    final width = view.physicalSize.width / view.devicePixelRatio;
    return Breakpoint.fromWidth(width);
  }

  @override
  Breakpoint build(BuildContext context) => _breakpoint;

  @override
  Object? get debugValue => _breakpoint;

  @override
  String get debugLabel => 'useBreakpoint';
}
