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
    final view = View.of(context);
    return Breakpoint.fromWidth(
      view.physicalSize.width / view.devicePixelRatio,
    );
  }

  @override
  Breakpoint build(BuildContext context) => _breakpoint;

  @override
  Object? get debugValue => _breakpoint;

  @override
  String get debugLabel => 'useBreakpoint';
}
