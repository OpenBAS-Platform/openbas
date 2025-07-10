package io.openbas.engine;

import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Filters;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.engine.api.*;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.query.EsSeries;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public interface EngineService {

  <T extends EsBase> void bulkProcessing(Stream<EsModel<T>> models);

  void bulkDelete(List<String> ids);

  long count(RawUserAuth user, CountRuntime runtime);

  EsSeries termHistogram(
      RawUserAuth user,
      StructuralHistogramWidget widgetConfig,
      StructuralHistogramWidget.StructuralHistogramSeries config,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters);

  List<EsSeries> multiTermHistogram(RawUserAuth user, StructuralHistogramRuntime runtime);

  EsSeries dateHistogram(
      RawUserAuth user,
      DateHistogramWidget widgetConfig,
      DateHistogramWidget.DateHistogramSeries config,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters);

  List<EsSeries> multiDateHistogram(RawUserAuth user, DateHistogramRuntime runtime);

  List<EsBase> entities(RawUserAuth user, ListRuntime runtime);

  ListConfiguration createListConfiguration(
      String entityName, Map<String, List<String>> filterValueMap);

  List<EsSearch> search(RawUserAuth user, String search, Filters.FilterGroup filter);
}
