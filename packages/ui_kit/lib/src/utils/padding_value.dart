import 'package:flutter/material.dart';

class PaddingValues extends EdgeInsets {
  static const EdgeInsets zero = PaddingValues();

  const PaddingValues({
    double? left,
    double? right,
    double? bottom,
    double? top,
    double? horizontal,
    double? vertical,
    double all = 0,
  }) : super.only(
         left: left ?? horizontal ?? all,
         right: right ?? horizontal ?? all,
         bottom: bottom ?? vertical ?? all,
         top: top ?? vertical ?? all,
       );
}
