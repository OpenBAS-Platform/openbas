package io.openbas.rest.dashboard;

import static io.openbas.config.SessionHelper.currentUser;

import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Widget;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.UserRepository;
import io.openbas.engine.api.*;
import io.openbas.engine.model.EsBase;
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

  public List<EsSeries> series(
      @NotNull final Widget widget,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    if (WidgetConfigurationType.TEMPORAL_HISTOGRAM.equals(
        widget.getWidgetConfiguration().getConfigurationType())) {
      DateHistogramWidget config = (DateHistogramWidget) widget.getWidgetConfiguration();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      DateHistogramRuntime runtime =
          new DateHistogramRuntime(config, parameters, definitionParameters);
      return esService.multiDateHistogram(userWithAuth, runtime);
    } else if (WidgetConfigurationType.STRUCTURAL_HISTOGRAM.equals(
        widget.getWidgetConfiguration().getConfigurationType())) {
      StructuralHistogramWidget config =
          (StructuralHistogramWidget) widget.getWidgetConfiguration();
      RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
      StructuralHistogramRuntime runtime =
          new StructuralHistogramRuntime(config, parameters, definitionParameters);
      return esService.multiTermHistogram(userWithAuth, runtime);
    }
    throw new UnsupportedOperationException("Unsupported widget: " + widget);
  }

  public List<EsBase> entities(
      @NotNull final Widget widget,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    ListConfiguration config = (ListConfiguration) widget.getWidgetConfiguration();
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    ListRuntime runtime = new ListRuntime(config, parameters, definitionParameters);

    return esService.entities(userWithAuth, runtime);
  }

  public List<EsSearch> search(final String search) {
    RawUserAuth userWithAuth = userRepository.getUserWithAuth(currentUser().getId());
    return esService.search(userWithAuth, search, null);
  }
}
