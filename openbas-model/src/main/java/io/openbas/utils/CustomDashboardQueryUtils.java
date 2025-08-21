package io.openbas.utils;

import static org.springframework.util.StringUtils.hasText;

import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.engine.api.WidgetConfiguration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

public class CustomDashboardQueryUtils {

  private CustomDashboardQueryUtils() {
  }

  public static Instant calcStartDate(
      Map<String, String> parameters,
      WidgetConfiguration widgetConfig,
      Map<String, CustomDashboardParameters> definitionParameters) {
    String timeRangeParameterId =
        definitionParameters.entrySet().stream()
            .filter(entry -> "timeRange".equals(entry.getValue().getType().name))
            .map(Map.Entry::getKey)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Missing parameter with type 'timeRange'"));

    String startDateParameterId =
        definitionParameters.entrySet().stream()
            .filter(entry -> "startDate".equals(entry.getValue().getType().name))
            .map(Map.Entry::getKey)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Missing parameter with type 'startDate'"));

    String dashboardTimeRange = parameters.get(timeRangeParameterId);
    String widgetTimeRange = widgetConfig.getTimeRange().name();
    switch (widgetTimeRange) {
      case "LAST_DAY":
        return Instant.now().minus(24, ChronoUnit.HOURS);
      case "LAST_WEEK":
        return Instant.now().minus(7, ChronoUnit.DAYS);
      case "LAST_MONTH":
        return Instant.now().minus(30, ChronoUnit.DAYS);
      case "LAST_QUARTER":
        return Instant.now().minus(90, ChronoUnit.DAYS);
      case "LAST_SEMESTER":
        return Instant.now().minus(180, ChronoUnit.DAYS);
      case "LAST_YEAR":
        return Instant.now().minus(360, ChronoUnit.DAYS);
      case "CUSTOM":
        if (hasText(widgetConfig.getStart())) {
          return Instant.parse(
              parameters.getOrDefault(widgetConfig.getStart(), widgetConfig.getStart()));
        }
      case "DEFAULT":
        if (!hasText(dashboardTimeRange)) {
          throw new RuntimeException("Dashboard timerange is not set");
        }
        switch (dashboardTimeRange) {
          case "LAST_DAY":
            return Instant.now().minus(24, ChronoUnit.HOURS);
          case "LAST_WEEK":
            return Instant.now().minus(7, ChronoUnit.DAYS);
          case "LAST_MONTH":
            return Instant.now().minus(30, ChronoUnit.DAYS);
          case "LAST_QUARTER":
            return Instant.now().minus(90, ChronoUnit.DAYS);
          case "LAST_SEMESTER":
            return Instant.now().minus(180, ChronoUnit.DAYS);
          case "LAST_YEAR":
            return Instant.now().minus(360, ChronoUnit.DAYS);
          case "CUSTOM":
            if (parameters.get(startDateParameterId) != null) {
              return Instant.parse(parameters.get(startDateParameterId));
            }
          default:
        }
      default:
    }
    return Instant.now();
  }

  public static Instant calcEndDate(
      Map<String, String> parameters,
      WidgetConfiguration widgetConfig,
      Map<String, CustomDashboardParameters> definitionParameters) {

    String timeRangeParameterId =
        definitionParameters.entrySet().stream()
            .filter(entry -> entry.getValue().getType().name.equals("timeRange"))
            .findFirst()
            .get()
            .getKey();
    String widgetTimeRange = widgetConfig.getTimeRange().name();
    String dashboardTimeRange = parameters.get(timeRangeParameterId);
    String endDateParameterId =
        definitionParameters.entrySet().stream()
            .filter(entry -> entry.getValue().getType().name.equals("endDate"))
            .findFirst()
            .get()
            .getKey();

    switch (widgetTimeRange) {
      case "CUSTOM":
        if (!widgetConfig.getEnd().isEmpty()) {
          return Instant.parse(
              parameters.getOrDefault(widgetConfig.getEnd(), widgetConfig.getEnd()));
        }
      case "DEFAULT":
        if (!hasText(dashboardTimeRange)) {
          throw new RuntimeException("Dashboard timerange is not set");
        }
        if (dashboardTimeRange.equals("CUSTOM")) {
          if (parameters.get(endDateParameterId) != null) {
            return Instant.parse(parameters.get(endDateParameterId));
          }
        } else {
          return Instant.now();
        }
      default:
        return Instant.now();
    }
  }
}
