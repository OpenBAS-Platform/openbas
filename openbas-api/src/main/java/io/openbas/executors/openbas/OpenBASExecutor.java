package io.openbas.executors.openbas;

import io.openbas.database.model.Endpoint;
import io.openbas.executors.ExecutorService;
import jakarta.annotation.PostConstruct;
import java.util.logging.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class OpenBASExecutor {

  private final ExecutorService executorService;
  public static final String OPENBAS_EXECUTOR_ID = "2f9a0936-c327-4e95-b406-d161d32a2501";
  public static final String OPENBAS_EXECUTOR_TYPE = "openbas_agent";
  public static final String OPENBAS_EXECUTOR_NAME = "OpenBAS Agent";
  public static final String OPENBAS_EXECUTOR_DOCUMENTATION_LINK =
      "https://docs.openbas.io/latest/usage/openbas-agent/";

  @PostConstruct
  public void init() {
    try {
      executorService.register(
          OPENBAS_EXECUTOR_ID,
          OPENBAS_EXECUTOR_TYPE,
          OPENBAS_EXECUTOR_NAME,
          OPENBAS_EXECUTOR_DOCUMENTATION_LINK,
          getClass().getResourceAsStream("/img/icon-openbas.png"),
          new String[] {
            Endpoint.PLATFORM_TYPE.Windows.name(),
            Endpoint.PLATFORM_TYPE.Linux.name(),
            Endpoint.PLATFORM_TYPE.MacOS.name()
          });
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error creating OpenBAS executor: " + e);
    }
  }
}
