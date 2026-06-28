import 'package:flutter/material.dart';
import 'package:ui_kit/src/extensions/build_context_extension.dart';

class SharedValue<T> extends InheritedWidget {
  const SharedValue({
    super.key,
    required this.value,
    required super.child,
  });

  final T value;

  static T? maybeOf<T>(BuildContext context) =>
      context.maybeOf<SharedValue<T>>()?.value;

  static T of<T>(BuildContext context) => context.of<SharedValue<T>>().value;

  @override
  bool updateShouldNotify(SharedValue oldWidget) => oldWidget.value != value;
}
