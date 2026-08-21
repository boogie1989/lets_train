import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

@RoutePage()
class MainLayout extends HookWidget {
  const MainLayout({super.key});

  @override
  Widget build(BuildContext context) {
    // final breakpoint = useBreakpoint();
    final bodyKey = useMemoized(() => GlobalKey());

    final body = Row(
      key: bodyKey,
      children: [
        // AnimatedSize(
        //   duration: const Duration(milliseconds: 300),
        //   child: breakpoint < Breakpoint.large
        //       ? const SizedBox(
        //           height: double.infinity,
        //         )
        //       : Container(
        //           width: 400,
        //           color: Colors.red,
        //         ),
        // ),
        const Expanded(
          child: AutoRouter(),
        ),
      ],
    );

    // if (breakpoint > Breakpoint.small) {
    //   return Scaffold(
    //     appBar: AppBar(
    //       title: Text(context.topRoute.title(context)),
    //       flexibleSpace: const SurfaceContainer(
    //         child: SizedBox.expand(),
    //       ),
    //     ),
    //     body: body,
    //   );
    // }

    return body;
  }
}
