package io.openbas.telemetry;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.baggage.propagation.W3CBaggagePropagator;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.trace.propagation.W3CTraceContextPropagator;
import io.opentelemetry.context.propagation.ContextPropagators;
import io.opentelemetry.context.propagation.TextMapPropagator;
import io.opentelemetry.exporter.logging.LoggingMetricExporter;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.SdkMeterProviderBuilder;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.semconv.ResourceAttributes;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import static java.util.Objects.requireNonNull;
import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
public class OpenTelemetryConfig {

  private final Environment env;

  @Bean
  public OpenTelemetry openTelemetry() {
    Resource resource = Resource.getDefault()
        .toBuilder()
        .put(ResourceAttributes.SERVICE_NAME, requireNonNull(this.env.getProperty("info.app.name")))
        .put(ResourceAttributes.SERVICE_VERSION, requireNonNull(this.env.getProperty("info.app.version")))
        .build();

    // Log exporter
    SdkMeterProviderBuilder sdkMeterProviderBuilder = SdkMeterProvider.builder()
        .registerMetricReader(PeriodicMetricReader.builder(LoggingMetricExporter.create()).build());

    // OTLP exporter
    String exporterOtlpEndpoint = this.env.getProperty("telemetry.exporter.otlp.endpoint");
    if (hasText(exporterOtlpEndpoint)) {
      sdkMeterProviderBuilder.registerMetricReader(PeriodicMetricReader.builder(
          OtlpHttpMetricExporter.builder().setEndpoint(exporterOtlpEndpoint).build()
      ).build());
    }

    SdkMeterProvider sdkMeterProvider = sdkMeterProviderBuilder
        .setResource(resource)
        .build();

    return OpenTelemetrySdk.builder()
        .setMeterProvider(sdkMeterProvider)
        .setPropagators(ContextPropagators.create(
            TextMapPropagator.composite(W3CTraceContextPropagator.getInstance(), W3CBaggagePropagator.getInstance())
        ))
        .build();
  }

  @Bean
  public Meter meter(@NotNull final OpenTelemetry openTelemetry) {
    return openTelemetry.meterBuilder(requireNonNull(this.env.getProperty("info.app.version")).replace(" ", "-") + "-metric")
        .setInstrumentationVersion("1.0.0")
        .build();
  }

}

