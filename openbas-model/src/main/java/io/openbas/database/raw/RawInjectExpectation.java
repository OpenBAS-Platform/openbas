package io.openbas.database.raw;

import java.util.List;

public interface RawInjectExpectation {

  default String getName() { return getUser_firstname() + " " + getUser_lastname(); }

  String getInject_expectation_type();

  Double getInject_expectation_score();

  Double getInject_expectation_expected_score();

  String getTeam_id();
  String getTeam_name();

  String getUser_id();
  String getUser_firstname();
  String getUser_lastname();

  String getAsset_id();
  String getAsset_name();
  String getAsset_type();
  String getEndpoint_platform();

  String getAsset_group_id();
  String getAsset_group_name();
  List<String> getAsset_ids();

  String getInject_expectation_id();

  String getExercise_id();
  String getInject_id();

  Boolean getInject_expectation_group();

}
