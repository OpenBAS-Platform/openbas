package io.openbas.database.raw;

public interface RawInjectExpectation {

    String getInject_expectation_type();

    Integer getInject_expectation_score();

    String getTeam_id();

    String getAsset_id();

    String getAsset_group_id();
    String getInject_expectation_id();
}
