package io.openbas.telemetry;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.ObservableDoubleMeasurement;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OpenTelemetryService {

  private static final String PREFIX_PRODUCT = "openbas";

  private final Environment env;

  private final Meter meter;

  private LongCounter longCounter;

  @PostConstruct
  private void init() {
    this.longCounter = this.meter
        .counterBuilder(PREFIX_PRODUCT + "app.login")
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

  // -- STATIC --

  // Not sure if it's the good way
  public void registerVersionMetric() {
    ObservableDoubleMeasurement longGauge = this.meter
        .gaugeBuilder(PREFIX_PRODUCT + "app.version")
        .setDescription("Software version")
        .setUnit("version")
        .buildObserver();
    String appVersion = Objects.requireNonNull(this.env.getProperty("info.app.version"));
    longGauge.record(1, Attributes.of(AttributeKey.stringKey("app.version"), appVersion));
  }

}
