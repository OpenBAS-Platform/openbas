package io.openbas.database.raw;

public interface RawInjectExpectationForCompute {

  String getInject_expectation_type();

  Double getInject_expectation_score();

  Double getInject_expectation_expected_score();

  RawTeam getTeam();

  RawAsset getAsset();

  RawAssetGroup getAsset_group();

  RawUser getUser();

  String getInject_expectation_id();

  Boolean getInject_expectation_group();
}
