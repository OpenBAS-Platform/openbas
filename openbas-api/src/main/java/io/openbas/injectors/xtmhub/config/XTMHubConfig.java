package io.openbas.injectors.xtmhub.config;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.xtm.hub")
@Data
public class XTMHubConfig {

    @NotNull
    private Boolean enable;

    private String url;

    public Boolean getEnable() {
        return enable;
    }

    public String getUrl() {
        return url;
    }
}
