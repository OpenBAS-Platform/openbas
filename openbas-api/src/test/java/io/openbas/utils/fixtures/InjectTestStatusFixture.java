package io.openbas.utils.fixtures;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectTestExecution;
import java.time.Instant;

public class InjectTestStatusFixture {

  private static InjectTestExecution createInjectTestStatus(ExecutionStatus status) {
    InjectTestExecution injectTestStatus = new InjectTestExecution();
    injectTestStatus.setTrackingSentDate(Instant.now());
    injectTestStatus.setName(status);
    return injectTestStatus;
  }

  public static InjectTestExecution createSuccessInjectStatus() {
    return createInjectTestStatus(ExecutionStatus.SUCCESS);
  }
}
