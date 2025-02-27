package io.openbas.config;

import static org.mockito.Mockito.*;

import io.openbas.database.repository.SettingRepository;
import io.openbas.executors.ExecutorService;
import io.openbas.service.AgentService;
import io.openbas.telemetry.OpenTelemetryConfig;
import io.openbas.telemetry.metric_collectors.ActionMetricCollector;
import io.openbas.telemetry.metric_collectors.AgentMetricCollector;
import io.openbas.telemetry.metric_collectors.MetricRegistry;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.MeterProvider;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

@Profile("test")
@Configuration
public class NoOpOpenTelemetryConfig {

  @Bean
  public OpenTelemetry openTelemetry() {
    return OpenTelemetry.noop();
  }

  @Bean
  public Meter meter() {
    return MeterProvider.noop().get("noop-meter");
  }

  @Bean
  public ActionMetricCollector actionMetricCollector(Meter meter) {
    return Mockito.mock(ActionMetricCollector.class);
  }

  @Bean
  public AgentMetricCollector agentMetricCollector(
      MetricRegistry metricRegistry,
      OpenTelemetryConfig openTelemetryConfig,
      AgentService agentService,
      ExecutorService executorService) {
    return Mockito.mock(AgentMetricCollector.class);
  }

  @Bean
  public OpenTelemetryConfig openTelemetryConfig(
      Environment environment, SettingRepository settingRepository) {
    return new OpenTelemetryConfig(environment, settingRepository);
  }
}
