package io.openbas.utils.fixtures;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.Team;

public class InjectExpectationFixture {

  static Long EXPIRATION_TIME_SIX_HOURS = 21600L;
  static Long EXPIRATION_TIME_ONE_HOUR = 3600L;

  static Double EXPECTED_SCORE = 100.0;

  public static InjectExpectation createPreventionInjectExpectation(Team team, Inject inject) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setInject(inject);
    injectExpectation.setType(InjectExpectation.EXPECTATION_TYPE.PREVENTION);
    injectExpectation.setTeam(team);
    injectExpectation.setExpectedScore(EXPECTED_SCORE);
    injectExpectation.setExpirationTime(EXPIRATION_TIME_SIX_HOURS);
    return injectExpectation;
  }

  public static InjectExpectation createDetectionInjectExpectation(Team team, Inject inject) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setInject(inject);
    injectExpectation.setType(InjectExpectation.EXPECTATION_TYPE.DETECTION);
    injectExpectation.setTeam(team);
    injectExpectation.setExpectedScore(EXPECTED_SCORE);
    injectExpectation.setExpirationTime(EXPIRATION_TIME_SIX_HOURS);
    return injectExpectation;
  }

  public static InjectExpectation createManualInjectExpectation(Team team, Inject inject) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setInject(inject);
    injectExpectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
    injectExpectation.setTeam(team);
    injectExpectation.setExpectedScore(EXPECTED_SCORE);
    injectExpectation.setExpirationTime(EXPIRATION_TIME_ONE_HOUR);
    return injectExpectation;
  }

  public static InjectExpectation createArticleInjectExpectation(Team team, Inject inject) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setInject(inject);
    injectExpectation.setType(InjectExpectation.EXPECTATION_TYPE.ARTICLE);
    injectExpectation.setTeam(team);
    injectExpectation.setExpectedScore(EXPECTED_SCORE);
    injectExpectation.setExpirationTime(EXPIRATION_TIME_ONE_HOUR);
    return injectExpectation;
  }

  public static InjectExpectation createManualInjectExpectationWithExercise(
      Team team, Inject inject, Exercise exercise, String expectationName) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setInject(inject);
    injectExpectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
    injectExpectation.setTeam(team);
    injectExpectation.setExpectedScore(EXPECTED_SCORE);
    injectExpectation.setExpirationTime(EXPIRATION_TIME_ONE_HOUR);
    injectExpectation.setExercise(exercise);
    injectExpectation.setName(expectationName);
    return injectExpectation;
  }
}
