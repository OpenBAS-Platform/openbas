package io.openbas.rest.attack_pattern.exports;

import static io.openbas.rest.attack_pattern.exports.AttackPatternMixin.*;

import com.fasterxml.jackson.annotation.JsonIncludeProperties;

@JsonIncludeProperties(
    value = {
      ATTACK_PATTERN_NAME,
      ATTACK_PATTERN_DESCRIPTION,
      ATTACK_PATTERN_EXTERNAL_ID,
    })
public abstract class AttackPatternMixin {
  static final String ATTACK_PATTERN_NAME = "attack_pattern_name";
  static final String ATTACK_PATTERN_DESCRIPTION = "attack_pattern_description";
  static final String ATTACK_PATTERN_EXTERNAL_ID = "attack_pattern_external_id";
}
