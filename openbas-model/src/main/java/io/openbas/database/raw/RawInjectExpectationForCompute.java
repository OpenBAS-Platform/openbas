package io.openbas.database.raw;

public interface RawInjectExpectationForCompute {

  String getInject_expectation_id();
  String getInject_expectation_type();

  Double getInject_expectation_score();

  Double getInject_expectation_expected_score();

  String getTeam_id();
  String getTeam_name();

  String getAsset_id();
  String getAsset_name();
  String getAsset_type();
  String getEndpoint_platform();

  String getAsset_group_id();
  String getAsset_group_name();
  String getAsset_group_asset_ids();

  String getUser_id();
  String getUser_name();

  Boolean getInject_expectation_group();
}
