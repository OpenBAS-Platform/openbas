package io.openbas.database.raw;

public interface RawInjectExpectation {

  String getInject_expectation_type();

  String getInject_expectation_name();

  Double getInject_expectation_score();

  Double getInject_expectation_expected_score();

  String getTeam_id();

  String getUser_id();

  String getAsset_id();

  String getAsset_group_id();

  String getInject_expectation_id();

  String getExercise_id();

  String getInject_id();

  Boolean getInject_expectation_group();
}
