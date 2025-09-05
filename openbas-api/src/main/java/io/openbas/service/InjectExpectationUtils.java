package io.openbas.service;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static java.util.Optional.ofNullable;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.execution.ExecutableInject;
import io.openbas.expectation.ExpectationPropertiesConfig;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InjectExpectationUtils {

  private InjectExpectationUtils() {}

  // -- SCORE --

  public static double computeScore(
      @NotNull final InjectExpectation expectation, @NotBlank final boolean success) {
    return success ? expectation.getExpectedScore() : 0.0;
  }

  // -- CONVERTER --

  public static InjectExpectation expectationConverter(
      @NotNull final ExecutableInject executableInject,
      Expectation expectation,
      ExpectationPropertiesConfig expectationPropertiesConfig) {
    InjectExpectation injectExpectation = new InjectExpectation();
    return expectationConverter(
        injectExpectation, executableInject, expectation, expectationPropertiesConfig);
  }

  public static InjectExpectation expectationConverter(
      @NotNull final Team team,
      @NotNull final ExecutableInject executableInject,
      Expectation expectation,
      ExpectationPropertiesConfig expectationPropertiesConfig) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setTeam(team);
    return expectationConverter(
        injectExpectation, executableInject, expectation, expectationPropertiesConfig);
  }

  public static InjectExpectation expectationConverter(
      @NotNull final Team team,
      @NotNull final User user,
      @NotNull final ExecutableInject executableInject,
      Expectation expectation,
      ExpectationPropertiesConfig expectationPropertiesConfig) {
    InjectExpectation injectExpectation = new InjectExpectation();
    injectExpectation.setTeam(team);
    injectExpectation.setUser(user);
    return expectationConverter(
        injectExpectation, executableInject, expectation, expectationPropertiesConfig);
  }

  private static InjectExpectation expectationConverter(
      @NotNull InjectExpectation injectExpectation,
      @NotNull final ExecutableInject executableInject,
      @NotNull final Expectation expectation,
      ExpectationPropertiesConfig expectationPropertiesConfig) {

    injectExpectation.setExercise(executableInject.getInjection().getExercise());
    injectExpectation.setInject(executableInject.getInjection().getInject());
    injectExpectation.setExpectedScore(expectation.getScore());
    injectExpectation.setExpectationGroup(expectation.isExpectationGroup());
    injectExpectation.setName(expectation.getName());
    injectExpectation.setExpirationTime(
        ofNullable(expectation.getExpirationTime())
            .orElse(expectationPropertiesConfig.getExpirationTimeByType(expectation.type())));

    switch (expectation) {
      case ChannelExpectation e when expectation.type() == ARTICLE -> {
        injectExpectation.setArticle(e.getArticle());
      }
      case ChallengeExpectation e when expectation.type() == CHALLENGE -> {
        injectExpectation.setChallenge(e.getChallenge());
      }
      case Expectation ignored when expectation.type() == DOCUMENT -> {
        injectExpectation.setType(DOCUMENT);
      }
      case Expectation ignored when expectation.type() == TEXT -> {
        injectExpectation.setType(TEXT);
      }
      case DetectionExpectation e when expectation.type() == DETECTION -> {
        injectExpectation.setDetection(e.getAgent(), e.getAsset(), e.getAssetGroup());
        injectExpectation.setSignatures(e.getInjectExpectationSignatures());
      }
      case PreventionExpectation e when expectation.type() == PREVENTION -> {
        injectExpectation.setPrevention(e.getAgent(), e.getAsset(), e.getAssetGroup());
        injectExpectation.setSignatures(e.getInjectExpectationSignatures());
      }
      case VulnerabilityExpectation e when expectation.type() == VULNERABILITY -> {
        injectExpectation.setVulnerability(e.getAgent(), e.getAsset(), e.getAssetGroup());
        injectExpectation.setSignatures(e.getInjectExpectationSignatures());
      }
      case ManualExpectation e when expectation.type() == MANUAL -> {
        injectExpectation.setManual(e.getAgent(), e.getAsset(), e.getAssetGroup());
        injectExpectation.setDescription(e.getDescription());
      }
      default -> throw new IllegalStateException("Unexpected value: " + expectation);
    }
    return injectExpectation;
  }
}
