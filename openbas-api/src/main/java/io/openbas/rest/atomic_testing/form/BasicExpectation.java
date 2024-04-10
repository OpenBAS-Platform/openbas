package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.rest.atomic_testing.form.AtomicTestingMapper.ExpectationType;
import jakarta.validation.constraints.NotNull;

public record BasicExpectation(@NotNull ExpectationType type, @NotNull ExecutionStatus result) {

}
