part of 'use_breakpoint_hook.dart';

// const _small = 768.0;
// const _medium = 1280.0;
const _small = 900.0;
const _medium = 1400.0;
const _large = double.infinity;

/// Viewport size buckets, named by size (not device) since they measure width.
/// Thresholds follow a column model: `small` = 1 column, `medium` = up to 2,
/// `large` = up to 3 (≈ 360 px per column).
///
/// [maxWidth] is the exclusive upper bound of each range, in logical pixels:
/// `small` < [_small] ≤ `medium` < [_medium] ≤ `large` (which is unbounded).
enum Breakpoint {
  /// Width < [_small] — phones and narrow windows. One-column layouts.
  small(_small),

  /// [_small] ≤ width < [_medium] — tablets and small laptops. Up to two
  /// columns.
  medium(_medium),

  /// Width ≥ [_medium] — desktop. Up to three columns. Unbounded upper edge.
  large(_large);

  const Breakpoint(this.maxWidth);

  /// Resolves the breakpoint for a given viewport [width].
  factory Breakpoint.fromWidth(double width) {
    if (width < small.maxWidth) return small;
    if (width < medium.maxWidth) return medium;
    return large;
  }

  /// Exclusive upper bound of this breakpoint's width range, in logical pixels.
  /// `large` is unbounded ([double.infinity]).
  final double maxWidth;

  /// Whether this is [Breakpoint.small].
  bool get isSmall => this == Breakpoint.small;

  /// Whether this is [Breakpoint.medium].
  bool get isMedium => this == Breakpoint.medium;

  /// Whether this is [Breakpoint.large].
  bool get isLarge => this == Breakpoint.large;

  /// Exhaustively maps each breakpoint to a value via a lazy callback — only
  /// the matching branch is invoked. All branches are required.
  ///
  /// Prefer [resolve] when you just need to pick a value (it takes eager
  /// values and allows omitting branches).
  R map<R>({
    required R Function() small,
    required R Function() medium,
    required R Function() large,
  }) => switch (this) {
    Breakpoint.small => small(),
    Breakpoint.medium => medium(),
    Breakpoint.large => large(),
  };

  /// Like [map] but every branch is optional; [orElse] is invoked when the
  /// matching branch is not provided.
  R maybeMap<R>({
    required R Function() orElse,
    R Function()? small,
    R Function()? medium,
    R Function()? large,
  }) =>
      mapOrNull(
        small: small,
        medium: medium,
        large: large,
      ) ??
      orElse();

  /// Like [map] but every branch is optional; returns `null` when the matching
  /// branch is not provided.
  R? mapOrNull<R>({
    R Function()? small,
    R Function()? medium,
    R Function()? large,
  }) => switch (this) {
    Breakpoint.small => small?.call(),
    Breakpoint.medium => medium?.call(),
    Breakpoint.large => large?.call(),
  };

  /// Eager value variant of [map] — picks a value per breakpoint without
  /// lambdas. Only [small] is required; an omitted [medium]/[large] falls back
  /// to the next-smaller defined value, so you specify only what differs.
  ///
  /// ```dart
  /// final columns = bp.resolve(small: 1, medium: 2, large: 3);
  /// final gutter  = bp.resolve(small: 16.0, large: 24.0); // medium → 16
  /// ```
  R resolve<R>({
    required R Function() small,
    R? Function()? medium,
    R? Function()? large,
  }) => switch (this) {
    Breakpoint.small => small(),
    Breakpoint.medium => medium?.call() ?? small(),
    Breakpoint.large => large?.call() ?? medium?.call() ?? small(),
  };

  List<R> resolveList<R>({
    R Function()? small,
    R Function()? medium,
    R Function()? large,
  }) => [
    if (this >= Breakpoint.small) ?small?.call(),
    if (this >= Breakpoint.medium) ?medium?.call(),
    if (isLarge) ?large?.call(),
  ];

  /// Ordered comparison by [maxWidth]: `small` < `medium` < `large`.
  /// Lets you gate layout on a minimum bucket, e.g. `bp >= Breakpoint.medium`.
  bool operator <(Breakpoint other) => maxWidth < other.maxWidth;
  bool operator <=(Breakpoint other) => maxWidth <= other.maxWidth;
  bool operator >(Breakpoint other) => maxWidth > other.maxWidth;
  bool operator >=(Breakpoint other) => maxWidth >= other.maxWidth;
}
