package io.openbas.rest.exercise.exports;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

import io.openbas.IntegrationTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(PER_CLASS)
public class ExportOptionsTest extends IntegrationTest {

  @Test
  public void test_mask_according_to_flags() {
    Assertions.assertEquals(0, ExportOptions.mask(false, false, false));
    Assertions.assertEquals(1, ExportOptions.mask(true, false, false));
    Assertions.assertEquals(2, ExportOptions.mask(false, true, false));
    Assertions.assertEquals(3, ExportOptions.mask(true, true, false));
    Assertions.assertEquals(4, ExportOptions.mask(false, false, true));
    Assertions.assertEquals(5, ExportOptions.mask(true, false, true));
    Assertions.assertEquals(6, ExportOptions.mask(false, true, true));
    Assertions.assertEquals(7, ExportOptions.mask(true, true, true));
  }

  @Test
  public void test_has_option() {
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(false, false, false)));
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(false, true, false)));
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(false, false, true)));
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(false, true, true)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(true, false, false)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(true, true, false)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(true, false, true)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_PLAYERS, ExportOptions.mask(true, true, true)));

    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(false, false, false)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(false, true, false)));
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(false, false, true)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(false, true, true)));
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(true, false, false)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(true, true, false)));
    Assertions.assertFalse(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(true, false, true)));
    Assertions.assertTrue(
        ExportOptions.has(ExportOptions.WITH_TEAMS, ExportOptions.mask(true, true, true)));

    Assertions.assertFalse(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(false, false, false)));
    Assertions.assertFalse(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(false, true, false)));
    Assertions.assertTrue(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(false, false, true)));
    Assertions.assertTrue(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(false, true, true)));
    Assertions.assertFalse(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(true, false, false)));
    Assertions.assertFalse(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(true, true, false)));
    Assertions.assertTrue(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(true, false, true)));
    Assertions.assertTrue(
        ExportOptions.has(
            ExportOptions.WITH_VARIABLE_VALUES, ExportOptions.mask(true, true, true)));
  }
}
