package io.openbas.model;

import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;

public interface Expectation {

    EXPECTATION_TYPE type();
    Integer getScore();

    default boolean isExpectationGroup() {
        return false;
    }

}
