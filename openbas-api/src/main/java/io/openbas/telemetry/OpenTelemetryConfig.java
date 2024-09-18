package io.openbas.telemetry;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.exporter.otlp.trace.OtlpGrpcSpanExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.sdk.resources.ResourceBuilder;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import io.opentelemetry.semconv.ServerAttributes;
import io.opentelemetry.semconv.ServiceAttributes;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.UUID;

import static io.opentelemetry.api.common.AttributeKey.stringKey;
import static java.util.Objects.requireNonNull;

@ConditionalOnProperty(prefix = "telemetry", name = "enable")
@Log
@Service
@RequiredArgsConstructor
public class OpenTelemetryConfig {

  private final Environment env;

  @Bean
  public OpenTelemetry openTelemetry() {
    Resource resource = buildResource();

    SdkTracerProvider tracerProvider = SdkTracerProvider.builder()
        .addSpanProcessor(SimpleSpanProcessor.create(OtlpGrpcSpanExporter.builder().build()))
        .setResource(resource)
        .build();

    return OpenTelemetrySdk.builder()
        .setTracerProvider(tracerProvider)
        .buildAndRegisterGlobal();
  }

  @Bean
  public Tracer tracer(@NotNull final OpenTelemetry openTelemetry) {
    return openTelemetry.getTracer("openbas-api-tracer");
  }

  // -- PRIVATE --

  private Resource buildResource() {
    ResourceBuilder resourceBuilder = Resource.getDefault().toBuilder()
        .put(ServiceAttributes.SERVICE_NAME, getRequiredProperty("info.app.name"))
        .put(ServiceAttributes.SERVICE_VERSION, getRequiredProperty("info.app.version"))
        .put(stringKey("instance.id"), UUID.randomUUID().toString());

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
