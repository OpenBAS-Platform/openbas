package io.openbas.telemetry;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OpenTelemetryService {

  private final Meter meter;

  private LongCounter longCounter;

  @PostConstruct
  private void init() {
    this.longCounter = this.meter
        .counterBuilder("app.login")
        .setDescription("Number of login connections")
        .setUnit("connections")
        .build();
  }

  public void login(@NotBlank final String email) {
    this.longCounter.add(
        1,
        Attributes.of(AttributeKey.stringKey("user.email"), email)
    );
    this.longCounter.add(1); // Global login count
  }

}
