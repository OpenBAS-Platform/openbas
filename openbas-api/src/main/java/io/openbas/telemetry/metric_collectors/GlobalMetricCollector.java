package io.openbas.telemetry.metric_collectors;

import io.openbas.database.model.Setting;
import io.openbas.service.PlatformSettingsService;
import io.openbas.service.UserService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GlobalMetricCollector {
  private final MetricRegistry metricRegistry;
  private final UserService userService;
  private final PlatformSettingsService platformSettingsService;

  @PostConstruct
  public void init() {
    metricRegistry.registerGauge("total_users_count", "Number of users", userService::globalCount);
    metricRegistry.registerGauge(
        "is_enterprise_edition",
        "enterprise Edition is activated",
        this::isEnterpriseEdition,
        "boolean");
  }

  private long isEnterpriseEdition() {
    return platformSettingsService
        .setting("platform_enterprise_edition")
        .map(Setting::getValue)
        .filter(Boolean::parseBoolean)
        .map(value -> 1)
        .orElse(0);
  }
}
