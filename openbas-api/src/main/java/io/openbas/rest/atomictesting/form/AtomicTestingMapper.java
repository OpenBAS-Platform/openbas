package io.openbas.rest.atomictesting.form;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.Team;
import java.time.Instant;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

public class AtomicTestingMapper {

  enum TARGET_TYPE {
    ASSETS,
    ASSETS_GROUPS,
    TEAMS
  }

  public static AtomicTestingOutput toDto(Inject inject) {
    return AtomicTestingOutput
        .builder()
        .title(inject.getTitle())
        .lastExecutionDate(getLastExecutionDate(inject))
        .targets(getTargets(inject))
        .build();
  }

  public static List<AtomicTestingOutput> toDto(List<Inject> injects) {
    return injects.stream().map(AtomicTestingMapper::toDto).toList();
  }

  private static Instant getLastExecutionDate(final Inject inject) {
    return inject.getStatus().map(InjectStatus::getDate).orElseGet(inject::getUpdatedAt);
  }

  private static List<BasicTarget> getTargets(final Inject inject) {
    return Stream.of(
            new BasicTarget(TARGET_TYPE.ASSETS,
                mapNames(inject.getAssets(), entity -> ((Asset) entity).getName())),
            new BasicTarget(TARGET_TYPE.ASSETS_GROUPS,
                mapNames(inject.getAssetGroups(), entity -> ((AssetGroup) entity).getName())),
            new BasicTarget(TARGET_TYPE.TEAMS,
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
}
