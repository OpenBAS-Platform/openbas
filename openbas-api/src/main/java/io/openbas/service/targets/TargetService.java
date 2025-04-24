package io.openbas.service.targets;

import io.openbas.database.model.*;
import io.openbas.service.targets.search.AssetGroupTargetSearchAdaptor;
import io.openbas.service.targets.search.EndpointTargetSearchAdaptor;
import io.openbas.utils.TargetType;
import io.openbas.utils.pagination.SearchPaginationInput;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TargetService {
  private final AssetGroupTargetSearchAdaptor assetGroupTargetSearchAdaptor;
  private final EndpointTargetSearchAdaptor endpointTargetSearchAdaptor;

  public Page<InjectTarget> injectTargets(
      TargetType injectTargetType, Inject inject, SearchPaginationInput input) {
    return switch (injectTargetType) {
      case ASSETS_GROUPS -> assetGroupTargetSearchAdaptor.search(input, inject);
      case ASSETS -> endpointTargetSearchAdaptor.search(input, inject);
      case AGENT -> null;
      case TEAMS -> null;
      case PLAYER -> null;
      default -> throw new IllegalArgumentException("Unsupported target type: " + injectTargetType);
    };
  }
}
