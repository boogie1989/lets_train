import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:ui_kit/ui_kit.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      themeMode: ThemeMode.dark,
      theme: createLightTheme(context),
      darkTheme: createDarkTheme(context),
      home: const MyScreen(),
      builder: (_, child) => ScreenBackground(
        child: child,
      ),
    );
  }
}

class MyScreen extends HookWidget {
  const MyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverFloatingHeader(
            child: Padding(
              padding: const PaddingValues(bottom: 32),
              child: SurfaceContainer(
                level: SurfaceLevel.high,
                borderRadius: BorderRadius.zero,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(minHeight: 400),
                  child: Column(
                    children: [
                      AppBar(
                        title: const Text('Calendar'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // const SliverToBoxAdapter(
          //   child: Padding(
          //     padding: PaddingValues(horizontal: 32),
          //     // child: SurfaceContainer(
          //     //   child: SizedBox(
          //     //     height: 150,
          //     //   ),
          //     // ),
          //     child: MyWidget(),
          //   ),
          // ),
          const SliverToBoxAdapter(
            child: Padding(
              padding: PaddingValues(horizontal: 32, top: 32),
              child: SurfaceContainer(
                child: SizedBox(
                  height: 200,
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(
            child: Padding(
              padding: PaddingValues(horizontal: 32, top: 32),
              child: SurfaceContainer(
                child: SizedBox(
                  height: 200,
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const PaddingValues(all: 32, horizontal: 32),
            sliver: SliverCrossAxisGroup(
              slivers: [
                SliverCrossAxisExpanded(
                  flex: 15,
                  sliver: SliverList.separated(
                    itemBuilder: (context, index) => ListTileBase(
                      title: Text('Some Title: $index'),
                    ),
                    separatorBuilder: (context, index) => const SizedBox(
                      height: 32,
                    ),
                    itemCount: 1000,
                  ),
                ),
                // const SliverToBoxAdapter(
                //   child: SizedBox(
                //     width: 32,
                //   ),
                // ),
                // SliverCrossAxisExpanded(
                //   flex: 15,
                //   sliver: SliverList.separated(
                //     itemBuilder: (context, index) => ListTileBase(
                //       glasses: false,
                //       title: Text('Some Title: $index'),
                //     ),
                //     separatorBuilder: (context, index) => const SizedBox(
                //       height: 32,
                //     ),
                //     itemCount: 1000,
                //   ),
                // ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(12);
    return ContourShadow(
      shadows: [
        const BoxShadow(
          offset: Offset(0, 6),
          blurRadius: 16,
          color: Color.fromRGBO(0, 0, 0, 0.30),
        ),
        const BoxShadow(
          offset: Offset(0, 16),
          blurRadius: 36,
          spreadRadius: -4,
          color: Color.fromRGBO(0, 0, 0, 0.45),
        ),
      ],
      borderRadius: borderRadius,
      child: Container(
        height: 150,
        decoration: BoxDecoration(
          color: const Color.fromRGBO(24, 24, 28, 0.55),
          borderRadius: borderRadius,
          border: Border.all(
            color: const Color.fromRGBO(255, 255, 255, 0.06),
            width: 1,
          ),
        ),
      ),
    );
  }
}
