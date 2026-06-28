import 'package:flutter/material.dart';

extension ContextEx on BuildContext {
  T? maybeOf<T extends InheritedWidget>() {
    return dependOnInheritedWidgetOfExactType<T>();
  }

  T of<T extends InheritedWidget>() {
    final result = maybeOf<T>();
    assert(result != null, 'No $T found in context');
    return result!;
  }

  T? maybeRead<T extends InheritedWidget>() {
    return findAncestorWidgetOfExactType<T>();
  }

  T read<T extends InheritedWidget>() {
    final result = maybeRead<T>();
    assert(result != null, 'No $T found in context');
    return result!;
  }
}
