package io.openbas.utils.fixtures;

import static io.openbas.database.model.Command.COMMAND_TYPE;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.PayloadCommandBlock;
import io.openbas.database.model.StatusPayload;
import java.time.Instant;
import java.util.List;

public class InjectStatusFixture {

  public static InjectStatus createDefaultInjectStatus() {
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setName(ExecutionStatus.PENDING);
    injectStatus.setPayloadOutput(
        new StatusPayload(
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
    return injectStatus;
  }
}
