package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;

public record BasicExpectation(EXPECTATION_TYPE type, String result) {

}
