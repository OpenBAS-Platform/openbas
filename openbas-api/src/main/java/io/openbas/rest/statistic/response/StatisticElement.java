package io.openbas.rest.statistic.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StatisticElement {
    @JsonProperty("global_count")
    private long global;

    @JsonProperty("progression_count")
    private long progression;

    public StatisticElement(long global, long progression) {
        this.global = global;
        this.progression = progression;
    }

    public long getGlobal() {
        return global;
    }

    public void setGlobal(long global) {
        this.global = global;
    }

    public long getProgression() {
        return progression;
    }

    public void setProgression(long progression) {
        this.progression = progression;
    }
}
