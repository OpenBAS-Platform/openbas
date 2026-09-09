package io.openaev.rest.finding;

import io.openaev.database.repository.FindingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persists a complete finding (the finding row plus its asset and tag links) in its own
 * transaction. The three statements replace a single modifying CTE that JSQLParser cannot parse, so
 * the tenant inspector can filter them once the findings table is activated. The {@code
 * REQUIRES_NEW} boundary lives here in the API layer (not on the repository) and is reached
 * cross-bean, so the new transaction actually applies.
 */
@Component
@RequiredArgsConstructor
public class FindingWriter {

  private final FindingRepository findingRepository;

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void saveCompleteFinding(
      String findingField,
      String findingType,
      String findingValue,
      String[] findingLabels,
      String injectId,
      String name,
      String assetId,
      String[] tagIds,
      String tenantId) {
    String findingId =
        findingRepository.upsertFinding(
            findingField, findingType, findingValue, findingLabels, injectId, name, tenantId);
    if (findingId == null) {
      // The tenant statement inspector rewrites the upsert's conflict branch to
      // "DO UPDATE SET ... WHERE can_access_tenant(findings.tenant_id) RETURNING finding_id".
      // On a conflict with no scope, or with a row owned by another tenant, that predicate is
      // false: nothing is updated, RETURNING yields nothing, and this comes back null. Refusing
      // here names the cause; without it the next line inserts a null finding_id into
      // findings_assets and the failure surfaces as a NOT NULL violation on a different table.
      throw new IllegalStateException(
          "Finding upsert returned no id for inject "
              + injectId
              + " in tenant "
              + tenantId
              + ": the conflicting row is outside the current tenant scope, or no scope is set on"
              + " this transaction. A background caller must open one (TenantScopedTransaction);"
              + " an HTTP caller must carry a TxCtx.");
    }
    findingRepository.insertFindingAsset(findingId, assetId);
    findingRepository.insertFindingTags(findingId, tagIds);
  }
}
