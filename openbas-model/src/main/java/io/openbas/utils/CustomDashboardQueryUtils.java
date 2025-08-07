package io.openbas.utils;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.engine.api.HistogramWidget;
import io.openbas.engine.api.WidgetConfiguration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import static org.springframework.util.StringUtils.hasText;

public class CustomDashboardQueryUtils {

  private CustomDashboardQueryUtils() {
  }

  public static Instant calcStartDate(Map<String, String> parameters, WidgetConfiguration widgetConfig,
      Map<String, CustomDashboardParameters> definitionParameters) {
    String timeRangeParameterId = definitionParameters.entrySet().stream()
        .filter(entry -> entry.getValue().getType().name.equals("timeRange")).findFirst().get().getKey();
    String startDateParameterId = definitionParameters.entrySet().stream()
        .filter(entry -> entry.getValue().getType().name.equals("startDate")).findFirst().get().getKey();
    String dashboardTimeRange = parameters.get(timeRangeParameterId);
    String widgetTimeRange = widgetConfig.getTimeRange().name();
    switch (widgetTimeRange) {
      case "ALL_TIME":
        return Instant.parse("2016-01-01T00:00:00Z");
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
        if (!widgetConfig.getStart().isEmpty()) {
          return Instant.parse(parameters.getOrDefault(widgetConfig.getStart(), widgetConfig.getStart()));
        }
        /*if (!widgetConfig.getEnd().isEmpty()) {
          end = Instant.parse(parameters.getOrDefault(widgetConfig.getEnd(), widgetConfig.getEnd()));
        }*/

      default:
        if (!hasText(dashboardTimeRange)) {
          throw new RuntimeException("Dashboard timerange is not set");
        }
        switch (dashboardTimeRange) {
          case "ALL_TIME":
            return Instant.parse("2016-01-01T00:00:00Z");
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
    }
    return Instant.now();
  }

  public static Instant calcEndDate(Map<String, String> parameters, WidgetConfiguration widgetConfig,
      Map<String, CustomDashboardParameters> definitionParameters) {

    String timeRangeParameterId = definitionParameters.entrySet().stream()
        .filter(entry -> entry.getValue().getType().name.equals("timeRange")).findFirst().get().getKey();
    String widgetTimeRange = widgetConfig.getTimeRange().name();
    String dashboardTimeRange = parameters.get(timeRangeParameterId);
    String endDateParameterId = definitionParameters.entrySet().stream()
        .filter(entry -> entry.getValue().getType().name.equals("endDate")).findFirst().get().getKey();

    switch (widgetTimeRange) {
      case "CUSTOM":
        if (!widgetConfig.getEnd().isEmpty()) {
          return Instant.parse(parameters.getOrDefault(widgetConfig.getEnd(), widgetConfig.getEnd()));
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
