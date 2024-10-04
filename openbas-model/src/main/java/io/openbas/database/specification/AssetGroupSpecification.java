package io.openbas.database.specification;

import io.openbas.database.model.AssetGroup;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class AssetGroupSpecification {

  private AssetGroupSpecification() {
  }

  public static Specification<AssetGroup> fromIds(@NotNull final List<String> ids) {
    return (root, query, builder) -> root.get("id").in(ids);
  }

}
