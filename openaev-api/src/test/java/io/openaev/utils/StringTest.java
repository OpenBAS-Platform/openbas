package io.openaev.utils;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

import org.junit.jupiter.api.Test;

public class StringTest {
  @Test
  void test() {
    String pattern = "(titi)";
    String in = "titi";

    assertThat(in.replaceFirst(pattern, "YOYO.$1")).isEqualTo("YOYO.titi");
  }
}
