import 'package:flutter/material.dart';

/// Paints the 1px specular highlight along the inner top edge — the CSS
/// `inset 0 1px 0` shadow, which [BoxShadow] cannot express. Used as a
/// `foregroundPainter` over the decorated box (glass cards, submit button).
class InnerTopHighlightPainter extends CustomPainter {
  InnerTopHighlightPainter({required this.color, required this.radius});

  final Color color;
  final BorderRadius radius;

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = radius.toRRect(Offset.zero & size);
    // The sliver between the rrect and itself shifted down 1px = the top
    // inner pixel row, following the corner curves.
    final sliver = Path.combine(
      PathOperation.difference,
      Path()..addRRect(rrect),
      Path()..addRRect(rrect.shift(const Offset(0, 1))),
    );
    canvas.drawPath(sliver, Paint()..color = color);
  }

  @override
  bool shouldRepaint(InnerTopHighlightPainter oldDelegate) =>
      oldDelegate.color != color || oldDelegate.radius != radius;
}
