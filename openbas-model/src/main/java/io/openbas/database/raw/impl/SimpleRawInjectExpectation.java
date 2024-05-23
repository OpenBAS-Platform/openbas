package io.openbas.database.raw.impl;

import io.openbas.database.raw.RawInjectExpectation;

public class SimpleRawInjectExpectation implements RawInjectExpectation {

    private String inject_expectation_type;
    private Integer inject_expectation_score;

    @Override
    public String getInject_expectation_type() {
        return inject_expectation_type;
    }

    @Override
    public Integer getInject_expectation_score() {
        return inject_expectation_score;
    }

    public void setInject_expectation_type(String inject_expectation_type) {
        this.inject_expectation_type = inject_expectation_type;
    }

    public void setInject_expectation_score(Integer inject_expectation_score) {
        this.inject_expectation_score = inject_expectation_score;
    }
}
