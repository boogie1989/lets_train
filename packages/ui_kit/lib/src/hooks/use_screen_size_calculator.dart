import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

ValueNotifier<T> useScreenSizeCalculator<T>(
  T Function(MediaQueryData mq) calculate, {
  List<Object?>? keys = const [],
}) {
  final listenable = use(
    _BreakpointHook(
      calculate,
      keys: keys,
    ),
  );

  return useListenable(listenable);
}

class _BreakpointHook<T> extends Hook<ValueNotifier<T>> {
  const _BreakpointHook(
    this.calculate, {
    super.keys = const [],
  });

  final T Function(MediaQueryData mq) calculate;

  @override
  _BreakpointHookState<T> createState() => _BreakpointHookState<T>();
}

class _BreakpointHookState<T>
    extends HookState<ValueNotifier<T>, _BreakpointHook<T>>
    with WidgetsBindingObserver {
  late ValueNotifier<T> value = ValueNotifier(
    hook.calculate(MediaQuery.of(context)),
  );

  @override
  void dispose() {
    value.dispose();
    super.dispose();
  }
  // late Size screenSize = getScreenSize();
  // late T value = hook.calculate(screenSize);

  // late FlutterView view = View.of(context);

  // @override
  // void initHook() {
  //   super.initHook();
  //   WidgetsBinding.instance.addObserver(this);
  // }

  // @override
  // void dispose() {
  //   WidgetsBinding.instance.removeObserver(this);
  //   super.dispose();
  // }

  // @override
  // void didChangeMetrics() {
  //   final nextSize = getScreenSize();
  //   if (nextSize != screenSize) {
  //     final nextValue = hook.calculate(
  //       screenSize = nextSize,
  //     );

  //     if (value != nextValue) {
  //       setState(() {
  //         value = nextValue;
  //       });
  //     }
  //   }
  // }

  // Size getScreenSize() {
  //   return view.physicalSize / view.devicePixelRatio;
  // }

  @override
  ValueNotifier<T> build(BuildContext context) {
    return value;
  }

  @override
  Object? get debugValue => value;

  @override
  String get debugLabel => 'useBreakpoint';

  @override
  void didUpdateHook(_BreakpointHook<T> oldHook) {
    print('UPDATE HOOK');
    super.didUpdateHook(oldHook);
  }
}
