package io.openbas.utils.fixtures;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.InjectStatusCommandLine;
import java.time.Instant;
import java.util.List;

public class InjectStatusFixture {
  public static InjectStatus createDefaultInjectStatus() {
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setName(ExecutionStatus.SUCCESS);
    injectStatus.setCommandsLines(
        new InjectStatusCommandLine(List.of("cmd"), List.of("clean cmd"), "id1234567"));
    return injectStatus;
  }
}
