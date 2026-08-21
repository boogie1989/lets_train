part of 'scaffold.dart';

sealed class UiBodySelector {
  const UiBodySelector();

  const factory UiBodySelector.child(Widget child) = UiScaffoldChild;
  const factory UiBodySelector.slivers(List<Widget> slivers) =
      UiScaffoldSlivers;
}

class UiScaffoldChild extends UiBodySelector {
  const UiScaffoldChild(this.child);

  final Widget? child;
}

class UiScaffoldSlivers extends UiBodySelector {
  const UiScaffoldSlivers(this.slivers);

  final List<Widget> slivers;
}
