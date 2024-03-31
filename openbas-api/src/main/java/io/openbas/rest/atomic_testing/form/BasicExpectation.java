package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.rest.atomic_testing.form.AtomicTestingMapper.ExpectationType;

public record BasicExpectation(ExpectationType type, ExecutionStatus result) {

}
