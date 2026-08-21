// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:app/ui/screens/calendar/calendar_module.dart' as _i1;
import 'package:app/ui/screens/calendar/calendar_screen.dart' as _i2;
import 'package:app/ui/screens/main_layout.dart' as _i3;
import 'package:auto_route/auto_route.dart' as _i4;

/// generated route for
/// [_i1.CalendarModuleScreen]
class CalendarModuleRoute extends _i4.PageRouteInfo<void> {
  const CalendarModuleRoute({List<_i4.PageRouteInfo>? children})
    : super(CalendarModuleRoute.name, initialChildren: children);

  static const String name = 'CalendarModuleRoute';

  static _i4.PageInfo page = _i4.PageInfo(
    name,
    builder: (data) {
      return const _i1.CalendarModuleScreen();
    },
  );
}

/// generated route for
/// [_i2.CalendarScreen]
class CalendarRoute extends _i4.PageRouteInfo<void> {
  const CalendarRoute({List<_i4.PageRouteInfo>? children})
    : super(CalendarRoute.name, initialChildren: children);

  static const String name = 'CalendarRoute';

  static _i4.PageInfo page = _i4.PageInfo(
    name,
    builder: (data) {
      return const _i2.CalendarScreen();
    },
  );
}

/// generated route for
/// [_i3.MainLayout]
class MainLayout extends _i4.PageRouteInfo<void> {
  const MainLayout({List<_i4.PageRouteInfo>? children})
    : super(MainLayout.name, initialChildren: children);

  static const String name = 'MainLayout';

  static _i4.PageInfo page = _i4.PageInfo(
    name,
    builder: (data) {
      return const _i3.MainLayout();
    },
  );
}
