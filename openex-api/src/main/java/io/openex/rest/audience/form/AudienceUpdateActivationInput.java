package io.openex.rest.audience.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AudienceUpdateActivationInput {

    @JsonProperty("audience_enabled")
    private boolean enabled;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
