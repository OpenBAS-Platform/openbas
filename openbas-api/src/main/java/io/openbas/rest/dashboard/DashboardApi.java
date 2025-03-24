package io.openbas.rest.dashboard;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.Filters;
import io.openbas.engine.api.DateHistogramConfig;
import io.openbas.engine.api.StructuralHistogramConfig;
import io.openbas.engine.model.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EsService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class DashboardApi extends RestBehavior {

  public static final String DASHBOARD_URI = "/api/dashboards";
  public static final String QUERY_URI = "/api/query";

  private EsService esService;

  @Autowired
  public void setEsService(EsService esService) {
    this.esService = esService;
  }

  @GetMapping(DASHBOARD_URI + "/temporal/{widget}")
  public List<EsTimeseries> timeSeries(@PathVariable String widget) {
    // TODO GET full config from saved widget
    // Hardcoded for now
    // Try to fetch a date histogram
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    Filters.Filter filter = new Filters.Filter();
    filter.setKey("base_entity");
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setValues(List.of("finding"));
    filterGroup.setFilters(List.of(filter));
    // Try to fetch a date histogram
    DateHistogramConfig config = new DateHistogramConfig("series01", filterGroup);
    return esService.multiDateHistogram(List.of(config));
  }

  @GetMapping(DASHBOARD_URI + "/structural/{widget}")
  public List<EsStructuralSeries> structuralSeries(@PathVariable String widget) {
    // TODO GET full config from saved widget
    // Hardcoded for now
    // Try to fetch a date histogram
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    Filters.Filter filter = new Filters.Filter();
    filter.setKey("base_entity");
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setValues(List.of("finding"));
    filterGroup.setFilters(List.of(filter));
    // Try to fetch a structural histogram
    StructuralHistogramConfig structuralConfig =
        new StructuralHistogramConfig("series01", filterGroup);
    structuralConfig.setField("finding_type"); // finding_scenario_side
    return esService.multiTermHistogram(List.of(structuralConfig));
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  public List<EsSearch> search(@PathVariable String search) {
    return esService.search(search, null);
  }
}
