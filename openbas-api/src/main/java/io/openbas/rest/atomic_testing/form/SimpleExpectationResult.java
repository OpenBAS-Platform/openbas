package io.openbas.rest.atomic_testing.form;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record SimpleExpectationResult(
    @NotNull String id,
    @NotNull ExpectationType type,
    @NotNull Instant startedAt,
    Instant endedAt,
    String logs,
    ExpectationStatus response
) {

}
