package io.openaev.database.audit;

/**
 * A finding written by a native upsert during an execution. The write bypasses the JPA listener
 * chain, so no {@link BaseEvent} fires for it: this event names what changed, for consumers that
 * must still learn it (the live invalidation stream).
 *
 * @param tenantId the finding's tenant
 * @param findingId the upserted finding
 * @param injectId the inject whose execution produced it
 * @param assetId the asset the finding was linked to
 */
public record FindingWrittenEvent(
    String tenantId, String findingId, String injectId, String assetId) {}
