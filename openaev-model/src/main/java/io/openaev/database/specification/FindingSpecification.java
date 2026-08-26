package io.openaev.database.specification;

import io.openaev.database.model.ContractOutputType;
import io.openaev.database.model.Finding;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class FindingSpecification {

  private FindingSpecification() {}

  public static Specification<Finding> findFindingsForInject(@NotNull final String injectId) {
    return (root, query, cb) -> cb.equal(root.get("inject").get("id"), injectId);
  }

  public static Specification<Finding> findFindingsForSimulation(
      @NotNull final String simulationId) {
    return (root, query, cb) ->
        cb.equal(root.get("inject").get("exercise").get("id"), simulationId);
  }

  public static Specification<Finding> findFindingsForScenario(@NotNull final String scenarioId) {
    return (root, query, cb) ->
        cb.equal(root.get("inject").get("exercise").get("scenario").get("id"), scenarioId);
  }

  public static Specification<Finding> findFindingsForEndpoint(@NotNull final String endpointId) {
    return (root, query, cb) -> cb.equal(root.get("assets").get("id"), endpointId);
  }

  public static Specification<Finding> distinctTypeValueWithFilter(
      Specification<Finding> baseSpec) {
    return (root, query, cb) -> {
      query.distinct(true);

      Subquery<String> subquery = query.subquery(String.class);
      Root<Finding> subRoot = subquery.from(Finding.class);

      Predicate specPredicate = null;
      if (baseSpec != null) {
        specPredicate = baseSpec.toPredicate(subRoot, query, cb);
      }

      // Correlated subquery: the most recent finding_updated_at within the same (type, value,
      // location) group as subRoot. Used below to restrict subRoot to only the row(s) that are
      // the most recently seen occurrence of that group, rather than picking an arbitrary row by
      // minimum id (an id has no guaranteed relationship to recency).
      //
      // Triforce Phase 1 (finding_triforce_design.md, Decision #1): the group now also includes
      // locationAsset.id, so findings on different assets no longer collapse into a single list
      // row. locationAsset.id is nullable (unlocated findings: multi-asset checks, or types not
      // yet covered by this migration's backfill) - a plain cb.equal would make Postgres treat
      // two NULLs as non-matching (NULL = NULL is unknown), which would wrongly split every
      // unlocated finding into its own group of one instead of keeping their pre-Phase-1
      // "grouped by (type, value) only" behavior. coalesce(...) to a sentinel that can never
      // collide with a real asset id makes two NULLs compare equal here, matching the groupBy
      // below (plain SQL GROUP BY already treats NULLs as equal for grouping purposes).
      Subquery<Instant> maxUpdatedAtSubquery = subquery.subquery(Instant.class);
      Root<Finding> maxRoot = maxUpdatedAtSubquery.from(Finding.class);
      Predicate maxSpecPredicate = null;
      if (baseSpec != null) {
        maxSpecPredicate = baseSpec.toPredicate(maxRoot, query, cb);
      }
      Expression<String> noLocationSentinel = cb.literal("__no_location__");
      Predicate sameGroup =
          cb.and(
              cb.equal(maxRoot.get("type"), subRoot.get("type")),
              cb.equal(maxRoot.get("value"), subRoot.get("value")),
              cb.equal(
                  cb.coalesce(maxRoot.get("locationAsset").get("id"), noLocationSentinel),
                  cb.coalesce(subRoot.get("locationAsset").get("id"), noLocationSentinel)));
      maxUpdatedAtSubquery.select(cb.greatest(maxRoot.<Instant>get("updateDate")));
      maxUpdatedAtSubquery.where(
          maxSpecPredicate != null ? cb.and(sameGroup, maxSpecPredicate) : sameGroup);

      // Tie-break on the minimum id when several rows within a group share the exact same
      // finding_updated_at, so the picked representative stays deterministic.
      subquery.select(cb.least(subRoot.<String>get("id")));
      Predicate isMostRecent = cb.equal(subRoot.get("updateDate"), maxUpdatedAtSubquery);
      subquery.where(specPredicate != null ? cb.and(specPredicate, isMostRecent) : isMostRecent);
      subquery.groupBy(
          subRoot.get("type"), subRoot.get("value"), subRoot.get("locationAsset").get("id"));

      return root.get("id").in(subquery);
    };
  }

  /**
   * "Also Detected On" (finding_triforce_design.md, Task 1): restricts to OTHER Findings sharing
   * the same (type, value) as {@code referenceFinding} but a DIFFERENT Location, excluding {@code
   * referenceFinding} itself. Meant to be wrapped in {@link #distinctTypeValueWithFilter} so
   * exactly one representative row (the most recently updated occurrence) comes back per sibling
   * Location, exactly like the main list's own de-duplication. Archived siblings are deliberately
   * NOT excluded here (Decision #10: always included, flagged instead) - callers still apply
   * {@link #withoutSoftDeleted()} as usual.
   *
   * <p>Phase 1 scope: if {@code referenceFinding} itself has no Location (multi-asset or a finding
   * type not yet covered by the backfill migration - see {@code Finding#locationAsset}), siblings
   * are still restricted to only the OTHER, located Findings of the same (type, value); this is a
   * best-effort fallback, not an exhaustive sibling list, and is an explicitly accepted Phase 1
   * limitation rather than a Phase 1b feature.
   */
  public static Specification<Finding> sameTypeValueDifferentLocation(Finding referenceFinding) {
    return (root, query, cb) -> {
      Predicate sameType = cb.equal(root.get("type"), referenceFinding.getType());
      Predicate sameValue = cb.equal(root.get("value"), referenceFinding.getValue());
      Predicate excludeSelf = cb.notEqual(root.get("id"), referenceFinding.getId());
      Predicate differentLocation =
          referenceFinding.getLocationAsset() == null
              ? cb.isNotNull(root.get("locationAsset"))
              : cb.or(
                  cb.isNull(root.get("locationAsset")),
                  cb.notEqual(
                      root.get("locationAsset").get("id"),
                      referenceFinding.getLocationAsset().getId()));
      return cb.and(sameType, sameValue, excludeSelf, differentLocation);
    };
  }

  /**
   * Filters findings by their effective archived status: a finding is archived either because it
   * was manually archived ({@code finding_archived_at} set via the bulk "Archive" action) or
   * because it has not been re-detected for more than {@code archiveDays} (tenant-configurable, see
   * {@code TenantSettingsService#findFindingArchiveDays}), mirroring the same computation
   * previously done client-side only (see FindingList.tsx history). Doing this in SQL - instead of
   * fetching every row and hiding archived ones in the UI - is what actually reduces the page's
   * load, since archived findings can vastly outnumber active ones over time.
   */
  public static Specification<Finding> withArchived(boolean archived, int archiveDays) {
    return (root, query, cb) -> {
      Instant cutoff = Instant.now().minus(archiveDays, ChronoUnit.DAYS);
      Predicate manuallyArchived = cb.isNotNull(root.get("archivedAt"));
      Predicate timedOut = cb.lessThan(root.<Instant>get("updateDate"), cutoff);
      Predicate isArchived = cb.or(manuallyArchived, timedOut);
      return archived ? isArchived : cb.not(isArchived);
    };
  }

  /**
   * Same "effective archived" computation as {@link #withArchived}, evaluated in plain Java
   * against an already-fetched {@link Finding} instead of in SQL - for callers (like the "Also
   * Detected On" panel) that need a per-row boolean flag on results that were not themselves
   * filtered by archived status (Decision #10: archived siblings are included, not excluded).
   */
  public static boolean isArchived(Finding finding, int archiveDays) {
    if (finding.getArchivedAt() != null) {
      return true;
    }
    Instant cutoff = Instant.now().minus(archiveDays, ChronoUnit.DAYS);
    return finding.getUpdateDate().isBefore(cutoff);
  }


  /**
   * Excludes findings soft-deleted by FindingSoftDeleteJob (manually archived for longer than its
   * grace period, see {@code Finding#softDeletedAt}). Unlike {@link #withArchived}, this is applied
   * unconditionally - regardless of the Active/Archived tab - by {@code
   * FindingDistinctSearchService#searchDistinctFindings} only; scoped views
   * (by-inject/simulation/scenario) never call this, so a soft-deleted finding stays fully visible
   * there.
   */
  public static Specification<Finding> withoutSoftDeleted() {
    return (root, query, cb) -> cb.isNull(root.get("softDeletedAt"));
  }

  public static Specification<Finding> withAssets() {
    return (root, query, cb) -> {
      root.fetch("assets", JoinType.LEFT);
      query.distinct(true);
      return null;
    };
  }

  public static Specification<Finding> findAllWithAssetsByTypeValueIn(
      List<ContractOutputType> types, List<String> values, Specification<Finding> specification) {
    return Specification.<Finding>unrestricted()
        .and(specification)
        .and(withAssets())
        .and(
            (root, query, cb) -> {
              Predicate typeIn = root.get("type").in(types);
              Predicate valueIn = root.get("value").in(values);
              return cb.and(typeIn, valueIn);
            });
  }
}
