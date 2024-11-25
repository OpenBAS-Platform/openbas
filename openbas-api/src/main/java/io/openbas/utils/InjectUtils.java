package io.openbas.utils;

import static io.openbas.database.model.Command.COMMAND_TYPE;

import io.openbas.database.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import io.openbas.rest.atomic_testing.form.AttackPatternSimpleDto;
import io.openbas.rest.atomic_testing.form.PayloadOutputDto;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class InjectUtils {

  private final ApplicationContext context;

  public PayloadOutput getCommandsLinesFromInject(final Inject inject) {
    if (inject == null) {
      return null;
    }

    if (inject.getStatus().isPresent() && inject.getStatus().get().getPayloadOutput() != null) {
      // Commands lines saved because inject has been executed
      return inject.getStatus().get().getPayloadOutput();
    } else if (inject.getInjectorContract().isPresent()) {
      InjectorContract injectorContract = inject.getInjectorContract().get();
      if (injectorContract.getPayload() != null
          && COMMAND_TYPE.equals(injectorContract.getPayload().getType())) {
        // Inject has a command payload
        Payload payload = injectorContract.getPayload();
        Command payloadCommand = (Command) Hibernate.unproxy(payload);
        return new PayloadOutput(COMMAND_TYPE, null, null, null, null, null, null, null, null, null,
            payloadCommand.getTags(), payloadCommand.getExternalId(), payloadCommand.getPrerequisites(),
            payloadCommand.getArguments(), payloadCommand.getContent() != null && !payloadCommand.getContent().isBlank()
            ? List.of(payloadCommand.getContent())
            : null,
            payloadCommand.getCleanupCommand() != null
                && !payloadCommand.getCleanupCommand().isBlank()
                ? List.of(payload.getCleanupCommand())
                : null,
            payload.getExternalId(), payloadCommand.getCleanupExecutor(),
            toAttackPatternSimples(payloadCommand.getAttackPatterns()), payloadCommand.getPlatforms(),
            payloadCommand.getDescription(), payloadCommand.getName(), payloadCommand.getCollectorType());

      } else {
        // Inject comes from Caldera ability and tomorrow from other(s) Executor(s)
        io.openbas.executors.Injector executor =
            context.getBean(
                injectorContract.getInjector().getType(), io.openbas.executors.Injector.class);
        return executor.getPayloadOutput(injectorContract.getId());
      }
    }
    return null;
  }

  // -- ATTACKPATTERN to ATTACKPATTERNSIMPLE
  public List<AttackPatternSimple> toAttackPatternSimples(List<AttackPattern> attackPatterns) {
    return attackPatterns.stream()
        .filter(Objects::nonNull)
        .map(this::toAttackPatternSimple)
        .toList();
  }

  private AttackPatternSimple toAttackPatternSimple(AttackPattern attackPattern) {
    return new AttackPatternSimple(attackPattern.getId(), attackPattern.getName(), attackPattern.getExternalId());
  }

  public List<InjectExpectation> getPrimaryExpectations(Inject inject) {
    List<String> firstIds = new ArrayList<>();

    firstIds.addAll(inject.getTeams().stream().map(Team::getId).toList());
    firstIds.addAll(inject.getAssets().stream().map(Asset::getId).toList());
    firstIds.addAll(inject.getAssetGroups().stream().map(AssetGroup::getId).toList());

    // Reject expectations if none of the team, asset, or assetGroup IDs exist in firstIds
    return inject.getExpectations().stream()
        .filter(
            expectation -> {
              boolean teamMatch =
                  expectation.getTeam() != null && firstIds.contains(expectation.getTeam().getId());
              boolean assetMatch =
                  expectation.getAsset() != null
                      && firstIds.contains(expectation.getAsset().getId());
              boolean assetGroupMatch =
                  expectation.getAssetGroup() != null
                      && firstIds.contains(expectation.getAssetGroup().getId());
              return teamMatch || assetMatch || assetGroupMatch;
            })
        .collect(Collectors.toList());
  }

  public static boolean checkIfRowIsEmpty(Row row) {
    if (row == null) {
      return true;
    }
    if (row.getLastCellNum() <= 0) {
      return true;
    }
    for (int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++) {
      Cell cell = row.getCell(cellNum);
      if (cell != null
          && cell.getCellType() != CellType.BLANK
          && StringUtils.isNotBlank(cell.toString())) {
        return false;
      }
    }
    return true;
  }
}
