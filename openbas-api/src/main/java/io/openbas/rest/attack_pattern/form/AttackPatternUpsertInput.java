package io.openbas.rest.attack_pattern.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

public class AttackPatternUpsertInput {

    @JsonProperty("attack_patterns")
    private List<AttackPatternCreateInput> attackPatterns = new ArrayList<>();

    public List<AttackPatternCreateInput> getAttackPatterns() {
        return attackPatterns;
    }

    public void setAttackPatterns(List<AttackPatternCreateInput> attackPatterns) {
        this.attackPatterns = attackPatterns;
    }
}
