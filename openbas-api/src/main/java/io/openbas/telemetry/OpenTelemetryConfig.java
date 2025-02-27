package io.openbas.telemetry;

import static io.openbas.database.model.SettingKeys.*;
import static io.opentelemetry.api.common.AttributeKey.stringKey;
import static java.util.Objects.requireNonNull;

import io.openbas.database.model.Setting;
import io.openbas.database.repository.SettingRepository;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.data.AggregationTemporality;
import io.opentelemetry.sdk.metrics.export.MetricReader;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.resources.ResourceBuilder;
import io.opentelemetry.semconv.ServerAttributes;
import io.opentelemetry.semconv.ServiceAttributes;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotBlank;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Log
@Service
@Profile("!test")
@RequiredArgsConstructor
public class OpenTelemetryConfig {

  private final Environment env;
  private final SettingRepository settingRepository;

  @Getter private Duration collectInterval;
  @Getter private Duration exportInterval;
  private final Duration DEFAULT_COLLECT_INTERVAL = Duration.ofMinutes(60);
  private final Duration DEFAULT_EXPORT_INTERVAL = Duration.ofMinutes(6 * 60);

  @PostConstruct
  private void initIntervals() {
    collectInterval =
        parseDuration("telemetry.collect.intervall.minutes", DEFAULT_COLLECT_INTERVAL);
    exportInterval = parseDuration("telemetry.export.intervall.minutes", DEFAULT_EXPORT_INTERVAL);
  }

  @Bean
  public OpenTelemetry openTelemetry() {
    log.info("Start telemetry");
    log.info("Using collect interval: " + collectInterval);
    log.info("Using export interval: " + exportInterval);
    Resource resource = buildResource();

    // Set OTLP Exporter
    OtlpHttpMetricExporter otlpExporter =
        OtlpHttpMetricExporter.builder()
            .setEndpoint(getRequiredProperty("telemetry.obas.endpoint"))
            .setAggregationTemporalitySelector(instrumentType -> AggregationTemporality.DELTA)
            .build();

    // Set Metric Reader
    MetricReader customMetricReader =
        new CustomMetricReader(otlpExporter, collectInterval, exportInterval);

    // Create MeterProvider
    SdkMeterProvider meterProvider =
        SdkMeterProvider.builder()
            .setResource(resource)
            .registerMetricReader(customMetricReader)
            .build();

    return OpenTelemetrySdk.builder().setMeterProvider(meterProvider).buildAndRegisterGlobal();
  }

  @Bean
  public Meter meter(@NotNull final OpenTelemetry openTelemetry) {
    return openTelemetry.getMeter("openbas-api-meter");
  }

  // -- PRIVATE --
  private Duration parseDuration(String propertyKey, Duration defaultValue) {
    return Optional.ofNullable(env.getProperty(propertyKey))
        .map(Long::parseLong)
        .map(Duration::ofMinutes)
        .orElse(defaultValue);
  }

  private Resource buildResource() {
    Setting instanceId =
        this.settingRepository.findByKey(PLATFORM_INSTANCE.key()).orElse(new Setting());
    Setting instanceCreationDate =
        this.settingRepository.findByKey(PLATFORM_INSTANCE_CREATION.key()).orElse(new Setting());
    ResourceBuilder resourceBuilder =
        Resource.getDefault().toBuilder()
            .put(
                ServiceAttributes.SERVICE_NAME,
                env.getProperty("telemetry.service.name", "openbas-telemetry"))
            .put(ServiceAttributes.SERVICE_VERSION, getRequiredProperty("info.app.version"))
            .put(stringKey("service.instance.id"), instanceId.getValue())
            .put(stringKey("service.instance.creation"), instanceCreationDate.getValue());

    try {
      String hostAddress = InetAddress.getLocalHost().getHostAddress();
      resourceBuilder.putAll(Attributes.of(ServerAttributes.SERVER_ADDRESS, hostAddress));
    } catch (UnknownHostException e) {
      log.severe("Failed to get host address: " + e.getMessage());
    }

    return resourceBuilder.build();
  }

  private String getRequiredProperty(@NotBlank final String key) {
    return requireNonNull(env.getProperty(key), "Property " + key + " must not be null");
  }
}
