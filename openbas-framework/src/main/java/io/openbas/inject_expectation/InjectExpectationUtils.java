package io.openbas.inject_expectation;

import static io.openbas.database.model.InjectExpectationSignature.EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME;
import static io.openbas.expectation.ExpectationPropertiesConfig.DEFAULT_HUMAN_EXPECTATION_EXPIRATION_TIME;
import static java.util.Optional.ofNullable;

import io.openbas.database.model.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;

public class InjectExpectationUtils {

  public static void computeResult(
      @NotNull final InjectExpectation expectation,
      @NotBlank final String sourceId,
      @NotBlank final String sourceType,
      @NotBlank final String sourceName,
      @NotBlank final String result,
      @NotBlank final Double score,
      final Map<String, String> metadata) {
    Optional<InjectExpectationResult> exists =
        expectation.getResults().stream().filter(r -> sourceId.equals(r.getSourceId())).findAny();
    if (exists.isPresent()) {
      exists.get().setResult(result);
      exists.get().setMetadata(metadata);
    } else {
      InjectExpectationResult expectationResult =
          InjectExpectationResult.builder()
              .sourceId(sourceId)
              .sourceType(sourceType)
              .sourceName(sourceName)
              .result(result)
              .date(Instant.now().toString())
              .score(score)
              .metadata(metadata)
              .build();
      expectation.getResults().add(expectationResult);
    }
  }

  // -- CONVERTER --

  public static InjectExpectation expectationConverter(
      @NotNull final ExecutableInject executableInject, Expectation expectation) {
    InjectExpectation expectationExecution = new InjectExpectation();
    return expectationConverter(expectationExecution, executableInject, expectation);
  }

  public static InjectExpectation expectationConverter(
      @NotNull final Team team,
      @NotNull final User user,
      @NotNull final ExecutableInject executableInject,
      Expectation expectation) {
    InjectExpectation expectationExecution = new InjectExpectation();
    expectationExecution.setTeam(team);
    expectationExecution.setUser(user);
    return expectationConverter(expectationExecution, executableInject, expectation);
  }

  public static InjectExpectation expectationConverter(
      @NotNull final Team team,
      @NotNull final ExecutableInject executableInject,
      Expectation expectation) {
    InjectExpectation expectationExecution = new InjectExpectation();
    expectationExecution.setTeam(team);
    return expectationConverter(expectationExecution, executableInject, expectation);
  }

  public static InjectExpectation expectationConverter(
      @NotNull InjectExpectation expectationExecution,
      @NotNull final ExecutableInject executableInject,
      @NotNull final Expectation expectation) {
    expectationExecution.setExercise(executableInject.getInjection().getExercise());
    expectationExecution.setInject(executableInject.getInjection().getInject());
    expectationExecution.setExpectedScore(expectation.getScore());
    expectationExecution.setExpectationGroup(expectation.isExpectationGroup());
    expectationExecution.setExpirationTime(
        ofNullable(expectation.getExpirationTime())
            .orElse(DEFAULT_HUMAN_EXPECTATION_EXPIRATION_TIME));
    switch (expectation.type()) {
      case ARTICLE -> {
        expectationExecution.setName(expectation.getName());
        expectationExecution.setArticle(((ChannelExpectation) expectation).getArticle());
      }
      case CHALLENGE -> {
        expectationExecution.setName(expectation.getName());
        expectationExecution.setChallenge(((ChallengeExpectation) expectation).getChallenge());
      }
      case DOCUMENT -> expectationExecution.setType(InjectExpectation.EXPECTATION_TYPE.DOCUMENT);
      case TEXT -> expectationExecution.setType(InjectExpectation.EXPECTATION_TYPE.TEXT);
      case DETECTION -> {
        DetectionExpectation detectionExpectation = (DetectionExpectation) expectation;
        expectationExecution.setName(detectionExpectation.getName());
        expectationExecution.setDetection(
            detectionExpectation.getAsset(), detectionExpectation.getAssetGroup());
        expectationExecution.setSignatures(detectionExpectation.getInjectExpectationSignatures());
      }
      case PREVENTION -> {
        PreventionExpectation preventionExpectation = (PreventionExpectation) expectation;
        expectationExecution.setName(preventionExpectation.getName());
        expectationExecution.setPrevention(
            preventionExpectation.getAsset(), preventionExpectation.getAssetGroup());
        expectationExecution.setSignatures(preventionExpectation.getInjectExpectationSignatures());
      }
      case MANUAL -> {
        ManualExpectation manualExpectation = (ManualExpectation) expectation;
        expectationExecution.setName(((ManualExpectation) expectation).getName());
        expectationExecution.setManual(
            manualExpectation.getAsset(), manualExpectation.getAssetGroup());
        expectationExecution.setDescription(((ManualExpectation) expectation).getDescription());
      }
      default -> throw new IllegalStateException("Unexpected value: " + expectation);
    }
    return expectationExecution;
  }

  // -- INJECT EXPECTATION SIGNATURE FOR OBAS IMPLANT EXECUTOR --

  public static List<InjectExpectationSignature> spawnSignatures(Inject inject, Payload payload) {
    List<InjectExpectationSignature> signatures = new ArrayList<>();
    List<String> knownPayloadTypes =
        Arrays.asList("Command", "Executable", "FileDrop", "DnsResolution");

    /*
     * Always add the "Parent process" signature type for the OpenBAS Implant Executor
     */
    signatures.add(
        createSignature(
            EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME, "obas-implant-" + inject.getId()));

    if (!knownPayloadTypes.contains(payload.getType())) {
      throw new UnsupportedOperationException(
          "Payload type " + payload.getType() + " is not supported");
    }
    return signatures;
  }

  private static InjectExpectationSignature createSignature(
      String signatureType, String signatureValue) {
    return InjectExpectationSignature.builder().type(signatureType).value(signatureValue).build();
  }
}
