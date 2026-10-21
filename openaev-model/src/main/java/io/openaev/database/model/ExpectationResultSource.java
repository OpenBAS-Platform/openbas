package io.openaev.database.model;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Source of an {@link InjectExpectationResult}: who wrote the result (a collector, a security
 * platform, a player, a challenge...). Kept free of any API dependency so it can become the
 * embedded source of the result once results leave the JSON column for their own table.
 *
 * @param id the ID of the source, the upsert key of the result on a leaf
 * @param type the kind of source (collector, challenge, media pressure...)
 * @param name the display name of the source
 * @param platform the security platform type of the source, if any
 * @param assetId the asset the source stands for, if any
 */
@Builder
public record ExpectationResultSource(
    @NotBlank String id,
    @NotBlank String type,
    @NotBlank String name,
    @Nullable String platform,
    @Nullable String assetId) {}
