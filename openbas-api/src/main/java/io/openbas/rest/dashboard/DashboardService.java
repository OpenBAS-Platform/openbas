package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Widget;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.api.*;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.query.EsSeries;
import io.openbas.service.EsService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DashboardService {

  private final EsService esService;
  private final UserRepository userRepository;

  public long count(final String type) {
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

  public List<EsSeries> series(@NotNull final Widget widget, Map<String, String> parameters) {
    if (DateHistogramWidget.TEMPORAL_MODE.equals(widget.getHistogramWidget().getMode())) {
      DateHistogramWidget config = (DateHistogramWidget) widget.getHistogramWidget();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      DateHistogramRuntime runtime = new DateHistogramRuntime(config, parameters);
      return esService.multiDateHistogram(userWithAuth, runtime);
    } else if (StructuralHistogramWidget.STRUCTURAL_MODE.equals(
        widget.getHistogramWidget().getMode())) {
      StructuralHistogramWidget config = (StructuralHistogramWidget) widget.getHistogramWidget();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      StructuralHistogramRuntime runtime = new StructuralHistogramRuntime(config, parameters);
      return esService.multiTermHistogram(userWithAuth, runtime);
    }
    throw new RuntimeException("Unsupported widget: " + widget);
  }

  public List<EsSearch> search(final String search) {
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.search(userWithAuth, search, null);
  }
}
