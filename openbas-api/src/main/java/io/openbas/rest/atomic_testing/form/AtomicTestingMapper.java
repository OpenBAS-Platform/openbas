package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.Team;
import java.time.Instant;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

public class AtomicTestingMapper {

  public static AtomicTestingOutput toDto(Inject inject) {
    return AtomicTestingOutput
        .builder()
        .title(inject.getTitle())
        .type(inject.getType())
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
                mapNames(inject.getAssets(), entity -> ((Asset) entity).getName())),
            new BasicTarget(TargetType.ASSETS_GROUPS,
                mapNames(inject.getAssetGroups(), entity -> ((AssetGroup) entity).getName())),
            new BasicTarget(TargetType.TEAMS,
                mapNames(inject.getTeams(), entity -> ((Team) entity).getName()))
        )
        .filter(target -> !target.names().isEmpty())
        .toList();
  }

  private static List<String> mapNames(List<? extends Object> entities,
      Function<Object, String> nameExtractor) {
    return entities.stream()
        .map(nameExtractor)
        .toList();
  }

  private static List<BasicExpectation> getExpectations(final Inject inject) {
    return Stream.of(
            new BasicExpectation(ExpectationType.PREVENTION,
                inject.getExpectations()
                    .stream()
                    .filter(e -> e.getType().equals(EXPECTATION_TYPE.PREVENTION))
                    .map(e ->e.getScore())
                    .mapToDouble(Integer::doubleValue)
                    .average() ?),
            new BasicExpectation(ExpectationType.DETECTION, inject.calculateResult()),
            new BasicExpectation(ExpectationType.HUMAN_RESPONSE, inject.calculateResult())
        )
        .toList();
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
