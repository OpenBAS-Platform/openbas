package io.openex.rest.media.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MediaUpdateLogoInput {

    @JsonProperty("media_logo_dark")
    private String logoDark;

    @JsonProperty("media_logo_light")
    private String logoLight;

    public String getLogoDark() {
        return logoDark;
    }

    public void setLogoDark(String logoDark) {
        this.logoDark = logoDark;
    }

    public String getLogoLight() {
        return logoLight;
    }

    public void setLogoLight(String logoLight) {
        this.logoLight = logoLight;
    }
}
