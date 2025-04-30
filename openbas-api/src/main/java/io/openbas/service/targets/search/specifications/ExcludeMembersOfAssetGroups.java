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
public class ExcludeMembersOfAssetGroups {
  private final AssetGroupRepository assetGroupRepository;

  public Specification<Endpoint> buildSpecification(List<String> assetGroupIds) {
    Specification<Endpoint> dynamicFiltersSpec = getDynamicFilterSpecification(assetGroupIds);
    Specification<Endpoint> transitiveMembershipSpec =
        getTransitiveTargetingSpecification(assetGroupIds);

    return dynamicFiltersSpec == null
        ? transitiveMembershipSpec
        : dynamicFiltersSpec.and(transitiveMembershipSpec);
  }

  private Specification<Endpoint> getDynamicFilterSpecification(List<String> assetGroupIds) {
    Specification<Endpoint> positiveSpec =
        compileFilterGroupsWithOR(
            assetGroupRepository.rawDynamicFiltersByAssetGroupIds(assetGroupIds).stream()
                .map(df -> df.getAssetGroupDynamicFilter())
                .filter(fg -> !fg.getFilters().isEmpty())
                .toList());

    return ((root, query, criteriaBuilder) -> {
      if (positiveSpec == null) {
        return null;
      }
      Subquery<Integer> subQuery = query.subquery(Integer.class);
      Root<Asset> assetTable = subQuery.from(Asset.class);

      subQuery
          .select(criteriaBuilder.literal(1))
          .where(
              positiveSpec.toPredicate(root, query, criteriaBuilder),
              criteriaBuilder.equal(
                  assetTable.get("id"), query.getRoots().stream().findFirst().get().get("id")));
      return criteriaBuilder.exists(subQuery).not();
    });
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
              assetGroupTable.get("id").in(assetGroupIds.stream().toList()));
      return criteriaBuilder.exists(subQuery).not();
    };
  }
}
