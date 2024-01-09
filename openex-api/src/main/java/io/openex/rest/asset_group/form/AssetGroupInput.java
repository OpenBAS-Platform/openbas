package io.openex.rest.asset_group.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class AssetGroupInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("asset_group_name")
    private String name;

    @JsonProperty("asset_group_description")
    private String description;
}
