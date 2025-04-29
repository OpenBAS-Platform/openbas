package io.openbas.service.targets;

import io.openbas.database.model.*;
import io.openbas.service.targets.search.AssetGroupTargetSearchAdaptor;
import io.openbas.service.targets.search.EndpointTargetSearchAdaptor;
import io.openbas.service.targets.search.TeamTargetSearchAdaptor;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.TargetType;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TargetService {
  private final AssetGroupTargetSearchAdaptor assetGroupTargetSearchAdaptor;
  private final EndpointTargetSearchAdaptor endpointTargetSearchAdaptor;
  private final TeamTargetSearchAdaptor teamTargetSearchAdaptor;

  public Page<InjectTarget> searchTargets(
      TargetType injectTargetType, Inject inject, SearchPaginationInput input) {
    return switch (injectTargetType) {
      case ASSETS_GROUPS -> assetGroupTargetSearchAdaptor.search(input, inject);
      case ASSETS -> endpointTargetSearchAdaptor.search(input, inject);
      case TEAMS -> teamTargetSearchAdaptor.search(input, inject);
      default -> throw new IllegalArgumentException("Unsupported target type: " + injectTargetType);
    };
  }

  public List<FilterUtilsJpa.Option> getTargetOptions(
      TargetType targetType, Inject inject, String searchText) {
    return switch (targetType) {
      case ASSETS_GROUPS -> assetGroupTargetSearchAdaptor.getOptionsForInject(inject);
      case ASSETS -> endpointTargetSearchAdaptor.getOptionsForInject(inject);
      case TEAMS -> teamTargetSearchAdaptor.getOptionsForInject(inject);
      default -> throw new IllegalArgumentException("Unsupported target type: " + targetType);
    };
  }

  public List<FilterUtilsJpa.Option> getTargetOptionsByIds(
      TargetType targetType, List<String> ids) {
    return switch (targetType) {
      case ASSETS_GROUPS -> assetGroupTargetSearchAdaptor.getOptionsByIds(ids);
      case ASSETS -> endpointTargetSearchAdaptor.getOptionsByIds(ids);
      case TEAMS -> teamTargetSearchAdaptor.getOptionsByIds(ids);
      default -> throw new IllegalArgumentException("Unsupported target type: " + targetType);
    };
  }
}
