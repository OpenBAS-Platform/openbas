package io.openbas.service.targets.search.specifications;

import io.openbas.database.model.*;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.utils.FilterUtilsJpa;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IncludeMembersOfAssetGroups {
  private final AssetGroupRepository assetGroupRepository;

  public Specification<Endpoint> buildSpecification(List<String> assetGroupIds) {
    Specification<Endpoint> dynamicFiltersSpec = getDynamicFilterSpecification(assetGroupIds);
    Specification<Endpoint> transitiveMembershipSpec =
        getTransitiveTargetingSpecification(assetGroupIds);

    return dynamicFiltersSpec == null ? transitiveMembershipSpec : dynamicFiltersSpec.or(transitiveMembershipSpec);
  }

  private Specification<Endpoint> getDynamicFilterSpecification(List<String> assetGroupIds) {
    return compileFilterGroupsWithOR(
        assetGroupRepository.rawDynamicFiltersByAssetGroupIds(assetGroupIds).stream()
            .map(df -> df.getAssetGroupDynamicFilter())
            .filter(fg -> !fg.getFilters().isEmpty())
            .toList());
  }

  private Specification<Endpoint> compileFilterGroupsWithOR(
      @NotNull List<Filters.FilterGroup> filterGroups) {
    Specification<Endpoint> result = null;
    for (Filters.FilterGroup filterGroup : filterGroups) {
      Specification<Endpoint> converted = FilterUtilsJpa.computeFilterGroupJpa(filterGroup);
      if (result == null) {
        result = converted;
        continue;
      }
      result = result.or(converted);
    }
    return result;
  }

  private Specification<Endpoint> getTransitiveTargetingSpecification(List<String> assetGroupIds) {
    return (root, query, criteriaBuilder) -> {
      Subquery<Integer> subQuery = query.subquery(Integer.class);
      Root<AssetGroup> assetGroupTable = subQuery.from(AssetGroup.class);
      Join<AssetGroup, Asset> assetJoin = assetGroupTable.join("assets");

      subQuery
          .select(criteriaBuilder.literal(1))
          .where(
              criteriaBuilder.equal(
                  assetJoin.get("id"), query.getRoots().stream().findFirst().get().get("id")),
              assetGroupTable.get("id").in(assetGroupIds));
      return criteriaBuilder.exists(subQuery);
    };
  }
}
