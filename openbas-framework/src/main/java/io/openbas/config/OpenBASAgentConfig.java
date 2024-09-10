package io.openbas.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.agent")
@Data
public class OpenBASAgentConfig {

    @JsonProperty("non-system-user")
    private String nonSystemUser;

    @JsonProperty("non-system-pwd")
    private String nonSystemPwd;

}
