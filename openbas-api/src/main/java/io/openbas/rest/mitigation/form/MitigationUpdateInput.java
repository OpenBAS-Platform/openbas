package io.openbas.rest.mitigation.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class MitigationUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("mitigation_name")
    private String name;

    @JsonProperty("mitigation_description")
    private String description;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("mitigation_external_id")
    private String externalId;

    @JsonProperty("mitigation_attack_patterns")
    private List<String> attackPatternsIds = new ArrayList<>();

}


