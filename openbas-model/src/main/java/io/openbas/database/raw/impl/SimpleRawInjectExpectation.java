package io.openbas.database.raw.impl;

import io.openbas.database.raw.RawInjectExpectation;

public class SimpleRawInjectExpectation implements RawInjectExpectation {

    private String inject_expectation_id;
    private String inject_expectation_type;
    private Integer inject_expectation_score;
    private String team_id;
    private String asset_id;
    private String asset_group_id;

    @Override
    public String getInject_expectation_type() {
        return inject_expectation_type;
    }

    @Override
    public Integer getInject_expectation_score() {
        return inject_expectation_score;
    }

    @Override
    public String getTeam_id() {
        return team_id;
    }

    @Override
    public String getAsset_id() {
        return asset_id;
    }

    @Override
    public String getAsset_group_id() {
        return asset_group_id;
    }

    @Override
    public String getInject_expectation_id() {
        return inject_expectation_id;
    }

    public void setInject_expectation_type(String inject_expectation_type) {
        this.inject_expectation_type = inject_expectation_type;
    }

    public void setInject_expectation_score(Integer inject_expectation_score) {
        this.inject_expectation_score = inject_expectation_score;
    }

    public void setTeam_id(String team_id) {
        this.team_id = team_id;
    }

    public void setAsset_id(String asset_id) {
        this.asset_id = asset_id;
    }

    public void setAsset_group_id(String asset_group_id) {
        this.asset_group_id = asset_group_id;
    }

    public void setInject_expectation_id(String inject_expectation_id) {
        this.inject_expectation_id = inject_expectation_id;
    }
}
