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
    // Triforce Phase 1: this write path always resolves exactly one asset before being called
    // (see FindingService#saveAgentFinding), so that same asset also serves as the Location for
    // the new identity key - no separate parameter needed.
    String findingId =
        findingRepository.upsertFinding(
            findingField, findingType, findingValue, findingLabels, injectId, assetId, name,
            tenantId);
    findingRepository.insertFindingAsset(findingId, assetId);
    findingRepository.insertFindingTags(findingId, tagIds);
  }
}
