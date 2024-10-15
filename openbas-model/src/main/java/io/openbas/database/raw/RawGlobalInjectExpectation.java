package io.openbas.database.raw;

public interface RawGlobalInjectExpectation {

  String getInject_expectation_type();

  Double getInject_expectation_score();

  Double getInject_expectation_expected_score();

  String getInject_title();

  String getInject_id();

  String getAttack_pattern_id();

}
