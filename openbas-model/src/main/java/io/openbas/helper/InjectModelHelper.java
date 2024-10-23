package io.openbas.helper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.StreamSupport;

import static io.openbas.database.model.Inject.SPEED_STANDARD;
import static java.time.Duration.between;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

public class InjectModelHelper {

  private InjectModelHelper() {
  }

  public static boolean isReady(
      InjectorContract injectorContract,
      ObjectNode content,
      boolean allTeams,
      @NotNull final List<String> teams,
      @NotNull final List<String> assets,
      @NotNull final List<String> assetGroups) {
    if (injectorContract == null) {
      return false;
    }
    if (content == null) {
      return false;
    }
    AtomicBoolean ready = new AtomicBoolean(true);
    ObjectNode contractContent = injectorContract.getConvertedContent();
    List<JsonNode> contractMandatoryFields = StreamSupport.stream(contractContent.get("fields").spliterator(), false)
        .filter(contractElement -> (contractElement.get("key").asText().equals("assets") || contractElement.get("mandatory").asBoolean() || (contractElement.get("mandatoryGroups") != null && contractElement.get("mandatoryGroups").asBoolean()))).toList();
    if (!contractMandatoryFields.isEmpty()) {
      contractMandatoryFields.forEach(jsonField -> {
        String key = jsonField.get("key").asText();
        if (key.equals("teams")) {
          if (teams.isEmpty() && !allTeams) {
            ready.set(false);
          }
        } else if (key.equals("assets")) {
          if (assets.isEmpty() && assetGroups.isEmpty()) {
            ready.set(false);
          }
        } else if (jsonField.get("type").asText().equals("text") && content.get(key) == null) {
          ready.set(false);
        } else if (jsonField.get("type").asText().equals("text") && content.get(key).asText().isEmpty()) {
          ready.set(false);
        }
      });
    }
    return ready.get();
  }

  public static Instant computeInjectDate(
      Instant source,
      int speed,
      Long dependsDuration,
      Exercise exercise) {
    // Compute origin execution date
    long duration = ofNullable(dependsDuration).orElse(0L) / speed;
    Instant dependingStart = source;
    Instant standardExecutionDate = dependingStart.plusSeconds(duration);
    // Compute execution dates with previous terminated pauses
    long previousPauseDelay = 0L;
    if (exercise != null) {
      previousPauseDelay = exercise.getPauses()
          .stream()
          .filter(pause -> pause.getDate().isBefore(standardExecutionDate))
          .mapToLong(pause -> pause.getDuration().orElse(0L)).sum();
    }
    Instant afterPausesExecutionDate = standardExecutionDate.plusSeconds(previousPauseDelay);
    // Add current pause duration in date computation if needed
    long currentPauseDelay = 0L;
    if (exercise != null) {
      currentPauseDelay = exercise.getCurrentPause()
          .map(last -> last.isBefore(afterPausesExecutionDate) ? between(last, now()).getSeconds() : 0L)
          .orElse(0L);
    }
    long globalPauseDelay = previousPauseDelay + currentPauseDelay;
    long minuteAlignModulo = globalPauseDelay % 60;
    long alignedPauseDelay = minuteAlignModulo > 0 ? globalPauseDelay + (60 - minuteAlignModulo) : globalPauseDelay;
    return standardExecutionDate.plusSeconds(alignedPauseDelay);
  }

  public static Optional<Instant> getDate(
      Exercise exercise,
      Scenario scenario,
      Long dependsDuration
  ) {
    if (exercise == null && scenario == null) {
      return Optional.ofNullable(now().minusSeconds(30));
    }

    if (scenario != null) {
      return Optional.empty();
    }

    if (exercise != null) {
      if (exercise.getStatus().equals(ExerciseStatus.CANCELED)) {
        return Optional.empty();
      }
      return exercise
          .getStart()
          .map(source -> computeInjectDate(source, SPEED_STANDARD, dependsDuration, exercise));
    }
    return Optional.ofNullable(LocalDateTime.now().toInstant(ZoneOffset.UTC));
  }

  public static Instant getSentAt(
      Optional<InjectStatus> status
  ) {
    if (status.isPresent()) {
      return status.orElseThrow().getTrackingSentDate();
    }
    return null;
  }

}
