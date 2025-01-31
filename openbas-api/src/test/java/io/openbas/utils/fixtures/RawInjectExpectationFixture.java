package io.openbas.utils.fixtures;

import io.openbas.database.raw.RawInjectExpectation;

public class RawInjectExpectationFixture {

  private record TestableRawInjectExpectation(
      String expectationType,
      Double expectationScore,
      Double expectationExpectedScore,
      String teamId,
      String userId,
      String assetId,
      String assetGroupId,
      String expectationId,
      String exerciseId,
      String injectId,
      Boolean expectationGroup)
      implements RawInjectExpectation {

    @Override
    public String getInject_expectation_type() {
      return expectationType;
    }

    @Override
    public Double getInject_expectation_score() {
      return expectationScore;
    }

    @Override
    public Double getInject_expectation_expected_score() {
      return expectationExpectedScore;
    }

    @Override
    public String getTeam_id() {
      return teamId;
    }

    @Override
    public String getUser_id() {
      return userId;
    }

    @Override
    public String getAgent_id() {
      return "";
    }

    @Override
    public String getAsset_id() {
      return assetId;
    }

    @Override
    public String getAsset_group_id() {
      return assetGroupId;
    }

    @Override
    public String getInject_expectation_id() {
      return expectationId;
    }

    @Override
    public String getExercise_id() {
      return exerciseId;
    }

    @Override
    public String getInject_id() {
      return injectId;
    }

    @Override
    public Boolean getInject_expectation_group() {
      return expectationGroup;
    }
  }

  public static RawInjectExpectation createDefaultInjectExpectation(
      String expectationType, Double expectationScore, Double expectationExpectedScore) {
    return new TestableRawInjectExpectation(
        expectationType,
        expectationScore,
        expectationExpectedScore,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        false);
  }
}
