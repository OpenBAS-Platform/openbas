package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.database.model.Filters;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.api.*;
import io.openbas.engine.model.*;
import io.openbas.engine.query.EsSeries;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EsService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

  @GetMapping(DASHBOARD_URI + "/series/{widget}")
  public List<EsSeries> series(@PathVariable String widget) {
    if (Objects.equals(widget, "temporal")) {
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
      Instant start = end.minus(30, ChronoUnit.DAYS);
      parameters.put("$start", start.toString());
      parameters.put("$end", end.toString());
      // Try to fetch a date histogram
      DateHistogramConfig config = new DateHistogramConfig("series01", filterGroup);
      config.setStart("$start");
      config.setEnd("$end");
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      DateHistogramRuntime runtime = new DateHistogramRuntime(List.of(config), parameters);
      return esService.multiDateHistogram(userWithAuth, runtime);
    }
    if (Objects.equals(widget, "structural")) {
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
          new StructuralHistogramRuntime(List.of(structuralConfig), parameters);
      return esService.multiTermHistogram(userWithAuth, runtime);
    }
    throw new RuntimeException("Unsupported widget: " + widget);
  }

  @GetMapping(DASHBOARD_URI + "/search/{search}")
  public List<EsSearch> search(@PathVariable String search) {
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.search(userWithAuth, search, null);
  }
}
