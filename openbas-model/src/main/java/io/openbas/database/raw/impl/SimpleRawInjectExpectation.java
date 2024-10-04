package io.openbas.database.raw.impl;

import io.openbas.database.raw.RawInjectExpectation;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimpleRawInjectExpectation implements RawInjectExpectation {

    private String inject_expectation_id;
    private String inject_expectation_type;
    private Double inject_expectation_score;
    private Double inject_expectation_expected_score;
    private String team_id;
    private String user_id;
    private String asset_id;
    private String asset_group_id;
    private String exercise_id;
    private Boolean inject_expectation_group;
}
