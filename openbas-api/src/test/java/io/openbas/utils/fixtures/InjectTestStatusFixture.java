package io.openbas.utils.fixtures;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectTestStatus;
import java.time.Instant;

public class InjectTestStatusFixture {

  private static InjectTestStatus createInjectTestStatus(ExecutionStatus status) {
    InjectTestStatus injectTestStatus = new InjectTestStatus();
    injectTestStatus.setTrackingSentDate(Instant.now());
    injectTestStatus.setName(status);
    return injectTestStatus;
  }

  public static InjectTestStatus createSuccessInjectStatus() {
    return createInjectTestStatus(ExecutionStatus.SUCCESS);
  }
}
