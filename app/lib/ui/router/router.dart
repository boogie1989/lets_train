import 'package:app/ui/router/router.gr.dart';
import 'package:auto_route/auto_route.dart';

@AutoRouterConfig()
class AppRouter extends RootStackRouter {
  @override
  List<AutoRoute> get routes => [
    AdaptiveRoute(
      initial: true,
      page: MainLayout.page,
      children: [
        ..._calendarRoutes,
      ],
    ),
  ];

  List<AutoRoute> get _calendarRoutes => [
    AdaptiveRoute(
      initial: true,
      page: CalendarModuleRoute.page,
      children: [
        AdaptiveRoute(
          initial: true,
          page: CalendarRoute.page,
        ),
      ],
    ),
  ];
}
