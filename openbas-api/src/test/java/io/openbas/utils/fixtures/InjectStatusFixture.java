package io.openbas.utils.fixtures;

import static io.openbas.database.model.Command.COMMAND_TYPE;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectExecution;
import io.openbas.database.model.PayloadCommandBlock;
import io.openbas.database.model.ExecutionPayload;
import java.time.Instant;
import java.util.List;

public class InjectStatusFixture {

  private static InjectExecution createInjectStatus(ExecutionStatus status) {
    InjectExecution injectExecution = new InjectExecution();
    injectExecution.setTrackingSentDate(Instant.now());
    injectExecution.setName(status);
    injectExecution.setPayloadOutput(
        new ExecutionPayload(
            null,
            null,
            COMMAND_TYPE,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            List.of(new PayloadCommandBlock("cmd", "content", List.of("clean cmd"))),
            "cmd"));
    return injectExecution;
  }

  public static InjectExecution createPendingInjectStatus() {
    return createInjectStatus(ExecutionStatus.PENDING);
  }

  public static InjectExecution createDraftInjectStatus() {
    return createInjectStatus(ExecutionStatus.DRAFT);
  }

  public static InjectExecution createQueuingInjectStatus() {
    return createInjectStatus(ExecutionStatus.QUEUING);
  }
}
