package io.openbas.utils;

import static io.openbas.database.model.Command.COMMAND_TYPE;

import io.openbas.database.model.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Log
public class InjectUtils {

  private final ApplicationContext context;

  public InjectStatusCommandLine getCommandsLinesFromInject(final Inject inject) {
    if (inject == null) {
      return null;
    }

    if (inject.getStatus().isPresent() && inject.getStatus().get().getCommandsLines() != null) {
      // Commands lines saved because inject has been executed
      return inject.getStatus().get().getCommandsLines();
    } else if (inject.getInjectorContract().isPresent()) {
      InjectorContract injectorContract = inject.getInjectorContract().get();
      if (injectorContract.getPayload() != null
          && COMMAND_TYPE.equals(injectorContract.getPayload().getType())) {
        // Inject has a command payload
        Payload payload = injectorContract.getPayload();
        Command payloadCommand = (Command) Hibernate.unproxy(payload);
        return new InjectStatusCommandLine(
            payloadCommand.getContent() != null && !payloadCommand.getContent().isBlank()
                ? List.of(payloadCommand.getContent())
                : null,
            payloadCommand.getCleanupCommand() != null
                    && !payloadCommand.getCleanupCommand().isBlank()
                ? List.of(payload.getCleanupCommand())
                : null,
            payload.getExternalId());
      } else {
        try {
          // Inject comes from Caldera ability and tomorrow from other(s) Executor(s)
          io.openbas.execution.Injector executor =
              context.getBean(
                  injectorContract.getInjector().getType(), io.openbas.execution.Injector.class);
          return executor.getCommandsLines(injectorContract.getId());
        } catch (NoSuchBeanDefinitionException e) {
          log.info(
              "No executor found for this injector: " + injectorContract.getInjector().getType());
          return null;
        }
      }
    }
    return null;
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
