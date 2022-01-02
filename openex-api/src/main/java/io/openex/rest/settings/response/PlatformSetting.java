package io.openex.rest.settings.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlatformSetting {

    @JsonProperty("setting_key")
    private String key;

    @JsonProperty("setting_value")
    private Object value;

    public PlatformSetting() {
        // Default constructor
    }

    public PlatformSetting(String key, Object value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
