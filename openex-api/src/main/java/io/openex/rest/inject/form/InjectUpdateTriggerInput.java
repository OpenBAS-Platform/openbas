package io.openex.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InjectUpdateTriggerInput {

    @JsonProperty("inject_depends_duration")
    private Long dependsDuration;

    public Long getDependsDuration() {
        return dependsDuration;
    }

    public void setDependsDuration(Long dependsDuration) {
        this.dependsDuration = dependsDuration;
    }
}
