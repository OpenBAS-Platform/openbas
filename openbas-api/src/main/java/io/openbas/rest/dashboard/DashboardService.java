package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Widget;
import io.openbas.database.raw.RawUserAuth;
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
  private final WidgetService widgetService;

  /**
   * Retrieves count data from Elasticsearch for a specific widget based on its configuration.
   *
   * @param widgetId the id from the {@link Widget} defining the type and configuration
   * @param parameters parameters passed at runtime (e.g. filters, date ranges)
   * @return long representing the count result
   */
  public long count(String widgetId, Map<String, String> parameters) {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> definitionParameters = customDashboard.toParametersMap();
    FlatConfiguration config = (FlatConfiguration) widget.getWidgetConfiguration();
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    CountRuntime runtime = new CountRuntime(config, parameters, definitionParameters);
    return engineService.count(userWithAuth, runtime);
  }

  /**
   * Retrieves time series or structural histogram data from Elasticsearch for a specific widget
   * based on its configuration.
   *
   * @param widgetId the id from the {@link Widget} defining the type and configuration
   * @param parameters parameters passed at runtime (e.g. filters, date ranges)
   * @return list of {@link EsSeries} representing series data suitable for charting
   * @throws RuntimeException if the widget type is unsupported
   */
  public List<EsSeries> series(String widgetId, Map<String, String> parameters) {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> definitionParameters = customDashboard.toParametersMap();
    if (WidgetConfigurationType.TEMPORAL_HISTOGRAM.equals(
        widget.getWidgetConfiguration().getConfigurationType())) {
      DateHistogramWidget config = (DateHistogramWidget) widget.getWidgetConfiguration();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      DateHistogramRuntime runtime =
          new DateHistogramRuntime(config, parameters, definitionParameters);
      return engineService.multiDateHistogram(userWithAuth, runtime);
    } else if (WidgetConfigurationType.STRUCTURAL_HISTOGRAM.equals(
        widget.getWidgetConfiguration().getConfigurationType())) {
      StructuralHistogramWidget config =
          (StructuralHistogramWidget) widget.getWidgetConfiguration();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      StructuralHistogramRuntime runtime =
          new StructuralHistogramRuntime(config, parameters, definitionParameters);
      return engineService.multiTermHistogram(userWithAuth, runtime);
    }
    throw new UnsupportedOperationException("Unsupported widget: " + widget);
  }

  /**
   * Retrieves a list of entities from Elasticsearch for a widget configured as a list.
   *
   * @param widgetId the id from the {@link Widget} with a list configuration
   * @param parameters parameters passed at runtime (e.g. filters)
   * @return list of {@link EsBase} entities matching the list widget query
   */
  public List<EsBase> entities(String widgetId, Map<String, String> parameters) {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> definitionParameters = customDashboard.toParametersMap();
    ListConfiguration config = (ListConfiguration) widget.getWidgetConfiguration();
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    ListRuntime runtime = new ListRuntime(config, parameters, definitionParameters);
    return engineService.entities(userWithAuth, runtime);
  }

  public List<EsAttackPath> attackPaths(String widgetId, Map<String, String> parameters)
      throws ExecutionException, InterruptedException {
    if (parameters == null) {
      parameters = Map.of();
    }
    Widget widget = this.widgetService.widget(widgetId);
    CustomDashboard customDashboard = widget.getCustomDashboard();
    Map<String, CustomDashboardParameters> definitionParameters = customDashboard.toParametersMap();
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    StructuralHistogramWidget config = (StructuralHistogramWidget) widget.getWidgetConfiguration();
    StructuralHistogramRuntime runtime =
        new StructuralHistogramRuntime(config, parameters, definitionParameters);
    return esAttackPathService.attackPaths(userWithAuth, runtime, parameters, definitionParameters);
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
}
