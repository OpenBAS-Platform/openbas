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

import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OpenTelemetryService {

  private static final String PREFIX_PRODUCT = "openbas";

  private final Environment env;

  private final Meter meter;

  private LongCounter longCounter;

  private final SessionCounterListener sessionCounterListener;

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

  // -- DYNAMIC --

  public void registerDynamicMetric() {
    this.registerActiveSessionsMetric();
  }

  private void registerActiveSessionsMetric() {
    LongCounter longCounter = this.meter
        .counterBuilder(PREFIX_PRODUCT + "app.sessions")
        .setDescription("Number of active sessions")
        .setUnit("sessions")
        .build();
    longCounter.add(this.sessionCounterListener.getActiveSessions());
  }

  // -- STATIC --

  public void registerStaticMetric() {
    this.registerVersionMetric();
    this.registerPositionMetric();
  }

  private void registerVersionMetric() {
    ObservableDoubleMeasurement longGauge = this.meter
        .gaugeBuilder(PREFIX_PRODUCT + "app.version")
        .setDescription("Software version")
        .setUnit("version")
        .buildObserver();
    String appVersion = Objects.requireNonNull(this.env.getProperty("info.app.version"));
    longGauge.record(1, Attributes.of(AttributeKey.stringKey("app.version"), appVersion));
  }

  private void registerPositionMetric() {
    ObservableDoubleMeasurement longGauge = this.meter
        .gaugeBuilder(PREFIX_PRODUCT + "app.country")
        .setDescription("Software country")
        .setUnit("country")
        .buildObserver();

    Locale locale = Locale.getDefault();
    String country = locale.getCountry(); // Code pays ISO 3166, 2 lettres

    longGauge.record(1, Attributes.of(AttributeKey.stringKey("app.country"), country));
  }

}
