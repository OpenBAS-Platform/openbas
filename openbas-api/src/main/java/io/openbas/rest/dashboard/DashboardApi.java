package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.Filters;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.api.*;
import io.openbas.engine.model.*;
import io.openbas.engine.query.EsStructuralSeries;
import io.openbas.engine.query.EsTimeseries;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EsService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

  private EsService esService;
  private UserRepository userRepository;

  @Autowired
  public void setEsService(EsService esService) {
    this.esService = esService;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping(DASHBOARD_URI + "/count/{widget}")
  public long count(@PathVariable String widget) {
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    Filters.Filter filter = new Filters.Filter();
    filter.setKey("base_entity");
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setValues(List.of("finding"));
    filterGroup.setFilters(List.of(filter));
    CountConfig config = new CountConfig("Series01", filterGroup);
    CountRuntime runtime = new CountRuntime(config);
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.count(userWithAuth, runtime);
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
    Map<String, String> parameters = new HashMap<>();
    Instant end = Instant.now();
    Instant start = end.minus(15, ChronoUnit.DAYS);
    parameters.put("$start", start.toString());
    parameters.put("$end", end.toString());
    // Try to fetch a date histogram
    DateHistogramConfig config = new DateHistogramConfig("series01", filterGroup);
    config.setStart("$start");
    config.setEnd("$end");
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    DateHistogramRuntime runtime = new DateHistogramRuntime(config, parameters);
    return esService.multiDateHistogram(userWithAuth, List.of(runtime));
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
    filter.setValues(List.of("$type"));
    filterGroup.setFilters(List.of(filter));
    Map<String, String> parameters = new HashMap<>();
    parameters.put("$type", "finding");
    // Try to fetch a structural histogram
    StructuralHistogramConfig structuralConfig =
        new StructuralHistogramConfig("series01", filterGroup);
    structuralConfig.setField("finding_scenario_side"); // finding_scenario_side
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    StructuralHistogramRuntime runtime =
        new StructuralHistogramRuntime(structuralConfig, parameters);
    return esService.multiTermHistogram(userWithAuth, List.of(runtime));
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  public List<EsSearch> search(@PathVariable String search) {
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.search(userWithAuth, search, null);
  }
}
