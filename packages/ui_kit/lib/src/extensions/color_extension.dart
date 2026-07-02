import 'dart:ui';

extension ColorEx on Color {
  /// Darkens toward black by [percent] (0..1): `0` = unchanged, `1` = black.
  /// Alpha is preserved.
  Color darken(double percent) {
    assert(percent >= 0 && percent <= 1, 'percent must be within 0..1');
    return Color.from(
      alpha: a,
      red: r * (1 - percent),
      green: g * (1 - percent),
      blue: b * (1 - percent),
      colorSpace: colorSpace,
    );
  }

  /// Lightens toward white by [percent] (0..1): `0` = unchanged, `1` = white.
  /// Alpha is preserved.
  Color lighten(double percent) {
    assert(percent >= 0 && percent <= 1, 'percent must be within 0..1');
    return Color.from(
      alpha: a,
      red: r + (1 - r) * percent,
      green: g + (1 - g) * percent,
      blue: b + (1 - b) * percent,
      colorSpace: colorSpace,
    );
  }

  /// Mixes toward [other] by [percent] (0..1): `0` = this color, `1` = [other].
  /// Interpolates all channels, alpha included.
  Color mix(Color other, double percent) {
    assert(percent >= 0 && percent <= 1, 'percent must be within 0..1');
    return Color.lerp(this, other, percent)!;
  }
}
