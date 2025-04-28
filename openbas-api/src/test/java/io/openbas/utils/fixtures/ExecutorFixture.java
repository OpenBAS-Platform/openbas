package io.openbas.utils.fixtures;

import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_NAME;
import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_NAME;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_TYPE;
import static io.openbas.executors.tanium.service.TaniumExecutorService.TANIUM_EXECUTOR_NAME;
import static io.openbas.executors.tanium.service.TaniumExecutorService.TANIUM_EXECUTOR_TYPE;

import io.openbas.database.model.Executor;
import io.openbas.database.repository.ExecutorRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ExecutorFixture {
  @Autowired ExecutorRepository executorRepository;

  private Executor createOBASExecutor() {
    Executor executor = new Executor();
    executor.setType(OPENBAS_EXECUTOR_TYPE);
    executor.setId(OPENBAS_EXECUTOR_ID);
    executor.setName(OPENBAS_EXECUTOR_NAME);
    return executor;
  }

  public Executor getDefaultExecutor() {
    Optional<Executor> executorOptional = executorRepository.findByType(OPENBAS_EXECUTOR_TYPE);
    return executorOptional.orElseGet(() -> executorRepository.save(createOBASExecutor()));
  }

  private Executor createCrowdstrikeExecutor() {
    Executor executor = new Executor();
    executor.setType(CROWDSTRIKE_EXECUTOR_TYPE);
    executor.setName(CROWDSTRIKE_EXECUTOR_NAME);
    executor.setId(UUID.randomUUID().toString());
    return executor;
  }

  private Executor createTaniumExecutor() {
    Executor executor = new Executor();
    executor.setType(TANIUM_EXECUTOR_TYPE);
    executor.setName(TANIUM_EXECUTOR_NAME);
    executor.setId(UUID.randomUUID().toString());
    return executor;
  }

  public Executor getCrowdstrikeExecutor() {
    Optional<Executor> executorOptional = executorRepository.findByType(CROWDSTRIKE_EXECUTOR_TYPE);
    return executorOptional.orElseGet(() -> executorRepository.save(createCrowdstrikeExecutor()));
  }

  public Executor getTaniumExecutor() {
    Optional<Executor> executorOptional = executorRepository.findByType(TANIUM_EXECUTOR_TYPE);
    return executorOptional.orElseGet(() -> executorRepository.save(createTaniumExecutor()));
  }
}
