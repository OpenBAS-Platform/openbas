package io.openex.player.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;

@Component
@ConfigurationProperties(prefix="openex")
public class OpenExConfig {

    @NotNull
    private String api;

    @NotNull
    private String token;

    @NotNull
    private String injectUri;

    @NotNull
    private String attachmentUri;

    public String getApi() {
        return api;
    }
    public void setApi(String api) {
        this.api = api;
    }

    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }

    public String getInjectUri() {
        return injectUri;
    }
    public void setInjectUri(String injectUri) {
        this.injectUri = injectUri;
    }

    public String getAttachmentUri() {
        return attachmentUri;
    }
    public void setAttachmentUri(String attachmentUri) {
        this.attachmentUri = attachmentUri;
    }
}
