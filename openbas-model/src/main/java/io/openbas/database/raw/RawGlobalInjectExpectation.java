package io.openbas.database.raw;

public interface RawGlobalInjectExpectation {

    String getInject_expectation_type();

    Integer getInject_expectation_score();

    Integer getInject_expectation_expected_score();

    String getInject_title();

    String getAttack_pattern_id();

}
