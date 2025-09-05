package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Widget;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.CustomDashboardRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.EngineService;
import io.openbas.engine.api.*;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.query.EsAttackPath;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.custom_dashboard.WidgetService;
import io.openbas.service.EsAttackPathService;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DashboardService {

  private final EsAttackPathService esAttackPathService;
  private final EngineService engineService;
  private final UserRepository userRepository;
  private final CustomDashboardRepository customDashboardRepository;
  private final WidgetService widgetService;

  /**
   * Retrieves count data from Elasticsearch for a specific widget based on its configuration.
   *
   * @param widgetId   the id from the {@link Widget} defining the type and configuration
   * @param parameters parameters passed at runtime (e.g. filters, date ranges)
   * @return long representing the count result
   */
  public long count(String widgetId, Map<String, String> parameters) {
    WidgetContext widgetContext = getWidgetContext(widgetId, parameters);
    FlatConfiguration config = (FlatConfiguration) widgetContext.widget().getWidgetConfiguration();
    CountRuntime runtime =
        new CountRuntime(config, widgetContext.parameters(), widgetContext.definitionParameters());
    return engineService.count(widgetContext.user(), runtime);
  }

  /**
   * Retrieves time series or structural histogram data from Elasticsearch for a specific widget based on its
   * configuration.
   *
   * @param widgetId   the id from the {@link Widget} defining the type and configuration
   * @param parameters parameters passed at runtime (e.g. filters, date ranges)
   * @return list of {@link EsSeries} representing series data suitable for charting
   * @throws RuntimeException if the widget type is unsupported
   */
  public List<EsSeries> series(String widgetId, Map<String, String> parameters) {
    WidgetContext widgetContext = getWidgetContext(widgetId, parameters);
    if (WidgetConfigurationType.TEMPORAL_HISTOGRAM.equals(
        widgetContext.widget().getWidgetConfiguration().getConfigurationType())) {
      DateHistogramWidget config =
          (DateHistogramWidget) widgetContext.widget().getWidgetConfiguration();
      DateHistogramRuntime runtime =
          new DateHistogramRuntime(
              config, widgetContext.parameters(), widgetContext.definitionParameters());
      return engineService.multiDateHistogram(widgetContext.user(), runtime);
    } else if (WidgetConfigurationType.STRUCTURAL_HISTOGRAM.equals(
        widgetContext.widget().getWidgetConfiguration().getConfigurationType())) {
      StructuralHistogramWidget config =
          (StructuralHistogramWidget) widgetContext.widget().getWidgetConfiguration();
      StructuralHistogramRuntime runtime =
          new StructuralHistogramRuntime(
              config, widgetContext.parameters(), widgetContext.definitionParameters());
      return engineService.multiTermHistogram(widgetContext.user(), runtime);
    }
    throw new UnsupportedOperationException("Unsupported widget: " + widgetContext.widget());
  }

  /**
   * Retrieves a list of entities from Elasticsearch for a widget configured as a list.
   *
   * @param widgetId   the id from the {@link Widget} with a list configuration
   * @param parameters parameters passed at runtime (e.g. filters)
   * @return list of {@link EsBase} entities matching the list widget query
   */
  public List<EsBase> entities(String widgetId, Map<String, String> parameters) {
    WidgetContext widgetContext = getWidgetContext(widgetId, parameters);
    ListConfiguration config = (ListConfiguration) widgetContext.widget().getWidgetConfiguration();
    ListRuntime runtime =
        new ListRuntime(config, widgetContext.parameters(), widgetContext.definitionParameters());
    return engineService.entities(widgetContext.user(), runtime);
  }

  public List<EsBase> entitiesRuntime(ListConfiguration config, Map<String, String> parameters,
      String customDashboardId) {
    CustomDashboard dashboard = customDashboardRepository.findById(customDashboardId).orElse(null);
    Map<String, CustomDashboardParameters> defParams = dashboard.toParametersMap();
    ListRuntime runtime =
        new ListRuntime(config, parameters, defParams);
    RawUserAuth user = userRepository.getUserWithAuth(currentUser().getId());
    //return new WidgetContext(runtime, parameters, defParams, user);
    return engineService.entities(user, runtime);
  }

  public List<EsAttackPath> attackPaths(String widgetId, Map<String, String> parameters)
      throws ExecutionException, InterruptedException {
    WidgetContext widgetContext = getWidgetContext(widgetId, parameters);
    StructuralHistogramWidget config =
        (StructuralHistogramWidget) widgetContext.widget().getWidgetConfiguration();
    StructuralHistogramRuntime runtime =
        new StructuralHistogramRuntime(
            config, widgetContext.parameters(), widgetContext.definitionParameters());
    return esAttackPathService.attackPaths(
        widgetContext.user(),
        runtime,
        widgetContext.parameters(),
        widgetContext.definitionParameters());
  }

  /**
   * Executes a global search query in Elasticsearch for the current user.
   *
   * @param search the search text
   * @return list of {@link EsSearch} search results
   */
  public List<EsSearch> search(final String search) {
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return engineService.search(userWithAuth, search, null);
  }

  private WidgetContext getWidgetContext(String widgetId, Map<String, String> parameters) {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = widgetService.widget(widgetId);
    CustomDashboard dashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> defParams = dashboard.toParametersMap();
    RawUserAuth user = userRepository.getUserWithAuth(currentUser().getId());
    return new WidgetContext(widget, parameters, defParams, user);
  }

  private record WidgetContext(
      Widget widget,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters,
      RawUserAuth user) {

  }
}
