package io.openex.model;

import io.openex.database.model.InjectExpectation.EXPECTATION_TYPE;

public interface Expectation {

    EXPECTATION_TYPE type();
    Integer getScore();

    default boolean isExpectationGroup() {
        return true;
    }

}
