import 'package:auto_route/auto_route.dart';
import 'package:calendar/calendar.dart' as calendar;
import 'package:flutter/material.dart';

@RoutePage()
class CalendarScreen extends StatelessWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // final breakpoint = useBreakpoint();

    // return breakpoint.maybeMap(
    //   orElse: () => const _LargeCalendarScreen(),
    //   small: () => const _SmallCalendarScreen(),
    // );

    return const calendar.CalendarScreen();
  }
}

// class _SmallCalendarScreen extends StatelessWidget {
//   const _SmallCalendarScreen()
//     : super(
//         key: const ValueKey('small_calendar'),
//       );

//   @override
//   Widget build(BuildContext context) {
//     const basePadding = PaddingValues(horizontal: 32, top: 32);

//     return const UiScaffold(
//       body: .slivers(
//         [
//           SliverPadding(
//             padding: PaddingValues(bottom: 32),
//             sliver: CalendarSliverAppBar(),
//           ),
//           SliverPadding(
//             padding: basePadding,
//             sliver: CalendarHowAreYouSliver(),
//           ),
//           SliverPadding(
//             padding: basePadding,
//             sliver: CalendarDayStatsSliver(),
//           ),

//           SliverPadding(
//             padding: basePadding,
//             sliver: CalendarDayItemsSliver(),
//           ),
//         ],
//       ),
//     );
//   }
// }

// double _percentParser(MediaQueryData mq) => double.parse(
//   math
//       .min<double>(
//         1,
//         mq.size.width / (Breakpoint.medium.maxWidth * 1.2),
//       )
//       .toStringAsExponential(1),
// );

// class _LargeCalendarScreen extends HookWidget {
//   const _LargeCalendarScreen()
//     : super(
//         key: const ValueKey('large_calendar'),
//       );

//   @override
//   Widget build(BuildContext context) {
//     const basePadding = PaddingValues(left: 16, top: 32);
//     final gridController = useScrollController();

//     final percent = useScreenSizeCalculator(_percentParser).value;

//     print(percent);

//     return UiScaffold(
//       appBar: AppBar(
//         title: Text(context.topRoute.title(context)),
//         flexibleSpace: const SurfaceContainer(
//           child: SizedBox.expand(),
//         ),
//       ),
//       body: .child(
//         Row(
//           spacing: 0,
//           children: [
//             Expanded(
//               child: CustomScrollView(
//                 controller: gridController,
//                 slivers: [
//                   SliverPadding(
//                     padding: const PaddingValues(
//                       horizontal: 16,
//                       vertical: 32,
//                       left: 32,
//                     ),
//                     sliver: SliverGrid.builder(
//                       gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
//                         crossAxisCount: 7,
//                         crossAxisSpacing: 16 * percent,
//                         mainAxisSpacing: 16 * percent,
//                       ),
//                       itemBuilder: (context, index) {
//                         return const AspectRatio(
//                           aspectRatio: 1,
//                           child: SurfaceContainer(),
//                         );
//                       },
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//             const Expanded(
//               child: Padding(
//                 padding: PaddingValues(right: 32),
//                 child: CustomScrollView(
//                   slivers: [
//                     // SliverPadding(
//                     //   padding: PaddingValues(bottom: 32),
//                     //   sliver: CalendarSliverAppBar(),
//                     // ),
//                     SliverPadding(
//                       padding: basePadding,
//                       sliver: CalendarHowAreYouSliver(),
//                     ),
//                     SliverPadding(
//                       padding: basePadding,
//                       sliver: CalendarDayStatsSliver(),
//                     ),

//                     SliverPadding(
//                       padding: basePadding,
//                       sliver: CalendarDayItemsSliver(),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
