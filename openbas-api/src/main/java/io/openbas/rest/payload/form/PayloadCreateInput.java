package io.openbas.rest.payload.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class PayloadCreateInput {
    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("payload_type")
    private String type;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("payload_name")
    private String name;

    @JsonProperty("payload_platforms")
    private String[] platforms;

    @JsonProperty("payload_description")
    private String description;

    @JsonProperty("command_executor")
    private String executor;

    @JsonProperty("command_content")
    private String content;

    @JsonProperty("payload_cleanup_executor")
    private String cleanupExecutor;

    @JsonProperty("payload_cleanup_command")
    private String cleanupCommand;

    @JsonProperty("payload_tags")
    private List<String> tagIds = new ArrayList<>();

    @JsonProperty("payload_attack_patterns")
    private List<String> attackPatternsIds = new ArrayList<>();
}


