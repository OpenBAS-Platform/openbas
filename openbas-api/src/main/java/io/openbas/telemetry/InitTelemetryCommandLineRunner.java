package io.openbas.telemetry;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(2)
public class InitTelemetryCommandLineRunner implements CommandLineRunner {

  private final OpenTelemetryService openTelemetryService;

  @Override
  public void run(String... args) {
    this.openTelemetryService.registerVersionMetric();
  }
}
