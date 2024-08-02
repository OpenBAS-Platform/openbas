package io.openbas.executors.caldera.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Setter
@Component
@ConfigurationProperties(prefix = "executor.caldera")
public class CalderaExecutorConfig {

    private final static String REST_V2_URI = "/api/v2";
    private final static String PLUGIN_ACCESS_URI = "/plugin/access";

    @Getter
    private boolean enable;

    @Getter
    @NotBlank
    private String id;

    @Getter
    @NotBlank
    private String url;

    @Getter
    @NotBlank
    private String publicUrl;

    @Getter
    @NotBlank
    private String apiKey;

    public String getRestApiV2Url() {
        return url + REST_V2_URI;
    }

    public String getPluginAccessApiUrl() {
        return url + PLUGIN_ACCESS_URI;
    }
}
