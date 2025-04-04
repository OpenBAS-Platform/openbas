package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.engine.api.HistogramWidget.HistogramConfigMode.STRUCTURAL;
import static io.openbas.engine.api.HistogramWidget.HistogramConfigMode.TEMPORAL;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Widget;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.api.*;
import io.openbas.engine.model.*;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.custom_dashboard.WidgetService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EsService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class DashboardApi extends RestBehavior {

  public static final String DASHBOARD_URI = "/api/dashboards";

  private final EsService esService;
  private final UserRepository userRepository;
  private final WidgetService widgetService;

  @GetMapping(DASHBOARD_URI + "/count/{type}")
  public long count(@PathVariable String type) {
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    Filters.Filter filter = new Filters.Filter();
    filter.setKey("base_entity");
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setValues(List.of(type));
    filterGroup.setFilters(List.of(filter));
    CountConfig config = new CountConfig("Series01", filterGroup);
    CountRuntime runtime = new CountRuntime(config);
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.count(userWithAuth, runtime);
  }

  @GetMapping(DASHBOARD_URI + "/series/{widgetId}")
  public List<EsSeries> series(@PathVariable final String widgetId) {
    Widget widget = this.widgetService.widget(widgetId);
    if (TEMPORAL.equals(widget.getHistogramWidget().getMode())) {
      DateHistogramWidget config = (DateHistogramWidget) widget.getHistogramWidget();
      Map<String, String> parameters = new HashMap<>();
      Instant end = Instant.now();
      Instant start = end.minus(30, ChronoUnit.DAYS);
      // FIXME: date is hardcoded
      parameters.put("$start", start.toString());
      parameters.put("$end", end.toString());
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      DateHistogramRuntime runtime = new DateHistogramRuntime(config, parameters);
      return esService.multiDateHistogram(userWithAuth, runtime);
    } else if (STRUCTURAL.equals(widget.getHistogramWidget().getMode())) {
      StructuralHistogramWidget config = (StructuralHistogramWidget) widget.getHistogramWidget();
      Map<String, String> parameters = new HashMap<>();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      StructuralHistogramRuntime runtime = new StructuralHistogramRuntime(config, parameters);
      return esService.multiTermHistogram(userWithAuth, runtime);
    }
    throw new RuntimeException("Unsupported widget: " + widget);
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  public List<EsSearch> search(@PathVariable final String search) {
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.search(userWithAuth, search, null);
  }
}
