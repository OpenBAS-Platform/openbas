package io.openbas.utils;

import static io.openbas.database.model.Command.COMMAND_TYPE;

import io.openbas.database.model.*;
import java.util.List;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class InjectUtils {

  private static ApplicationContext context;

  private InjectUtils() {}

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

  public static Optional<InjectStatusCommandLine> getCommandsLinesFromInject(final Inject inject) {
    if (inject.getStatus().isPresent() && inject.getStatus().get().getCommandsLines() != null) {
      // Commands lines saved because inject has been executed
      return Optional.ofNullable(inject.getStatus().get().getCommandsLines());
    } else if (inject.getInjectorContract().isPresent()) {
      InjectorContract injectorContract = inject.getInjectorContract().get();
      if (injectorContract.getPayload() != null
          && COMMAND_TYPE.equals(injectorContract.getPayload().getType())) {
        // Inject has a command payload
        Payload payload = injectorContract.getPayload();
        Command payloadCommand = (Command) Hibernate.unproxy(payload);
        return Optional.of(
            new InjectStatusCommandLine(
                payloadCommand.getContent() != null && !payloadCommand.getContent().isBlank()
                    ? List.of(payloadCommand.getContent())
                    : null,
                payloadCommand.getCleanupCommand() != null
                        && !payloadCommand.getCleanupCommand().isBlank()
                    ? List.of(payload.getCleanupCommand())
                    : null,
                payload.getExternalId()));
      } else {
        // Inject comes from Caldera ability and tomorrow from other(s) Executor(s)
        io.openbas.execution.Injector executor =
            context.getBean(
                injectorContract.getInjector().getType(), io.openbas.execution.Injector.class);
        return Optional.ofNullable(executor.getCommandsLines(injectorContract.getId()));
      }
    }
    return Optional.empty();
  }
}
