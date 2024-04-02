package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.Team;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.function.Function;
import java.util.stream.Stream;
import org.jetbrains.annotations.NotNull;

public class AtomicTestingMapper {

  public static AtomicTestingOutput toDto(Inject inject) {
    return AtomicTestingOutput
        .builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .type(inject.getType())
        .contract(inject.getContract())
        .lastExecutionDate(getLastExecutionDate(inject))
        .targets(getTargets(inject))
        .expectations(getExpectations(inject))
        .build();
  }

  public static List<AtomicTestingOutput> toDto(List<Inject> injects) {
    return injects.stream().map(AtomicTestingMapper::toDto).toList();
  }

  private static Instant getLastExecutionDate(final Inject inject) {
    return inject.getStatus().map(InjectStatus::getTrackingEndDate).orElseGet(inject::getUpdatedAt);
  }

  private static List<BasicTarget> getTargets(final Inject inject) {
    return Stream.of(
            new BasicTarget(TargetType.ASSETS,
                getNames(inject.getAssets(), entity -> ((Asset) entity).getName())),
            new BasicTarget(TargetType.ASSETS_GROUPS,
                getNames(inject.getAssetGroups(), entity -> ((AssetGroup) entity).getName())),
            new BasicTarget(TargetType.TEAMS,
                getNames(inject.getTeams(), entity -> ((Team) entity).getName()))
        )
        .filter(target -> !target.names().isEmpty())
        .toList();
  }

  private static List<String> getNames(List<? extends Object> entities,
      Function<Object, String> nameExtractor) {
    return entities.stream()
        .map(nameExtractor)
        .toList();
  }

  private static List<BasicExpectation> getExpectations(final Inject inject) {
    OptionalDouble avgPrevention = calculateAverageFromExpectations(List.of(EXPECTATION_TYPE.PREVENTION), inject);
    OptionalDouble avgDetection = calculateAverageFromExpectations(List.of(EXPECTATION_TYPE.DETECTION), inject);
    OptionalDouble avgHumanResponse = calculateAverageFromExpectations(List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL), inject);

    return buildBasicExpectations(avgPrevention, avgDetection, avgHumanResponse);
  }

  @NotNull
  private static List<BasicExpectation> buildBasicExpectations(OptionalDouble avgPrevention, OptionalDouble avgDetection, OptionalDouble avgHumanResponse) {
    List<BasicExpectation> resultAvgOfExpectations = new ArrayList<>();
    if (avgPrevention.isPresent()) {
      resultAvgOfExpectations.add(new BasicExpectation(ExpectationType.PREVENTION, getResult(avgPrevention)));
    }
    if (avgDetection.isPresent()) {
      resultAvgOfExpectations.add(new BasicExpectation(ExpectationType.DETECTION, getResult(avgDetection)));
    }
    if (avgHumanResponse.isPresent()) {
      resultAvgOfExpectations.add(new BasicExpectation(ExpectationType.HUMAN_RESPONSE, getResult(avgHumanResponse)));
    }
    return resultAvgOfExpectations;
  }

  private static ExecutionStatus getResult(OptionalDouble avg) {
    Double avgAsDouble = avg.getAsDouble();
    return avgAsDouble == 0.0 ? ExecutionStatus.ERROR :
        (avgAsDouble == 1.0 ? ExecutionStatus.SUCCESS :
            ExecutionStatus.PARTIAL);
  }

  private static OptionalDouble calculateAverageFromExpectations(List<EXPECTATION_TYPE> types, Inject inject) {
    return inject.getExpectations()
        .stream()
        .filter(e -> types.contains(e.getType()))
        .mapToInt(InjectExpectation::getScore)
        .map(score -> score == 0 ? 0 : 1)
        .average();
  }

  enum TargetType {
    ASSETS,
    ASSETS_GROUPS,
    TEAMS
  }

  enum ExpectationType {
    PREVENTION,
    DETECTION,
    HUMAN_RESPONSE
  }

}
