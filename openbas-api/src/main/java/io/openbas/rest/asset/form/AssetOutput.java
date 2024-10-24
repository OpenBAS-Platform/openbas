package io.openbas.rest.asset.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@SuperBuilder
@Data
public abstract class AssetOutput {
    @NotBlank
    @JsonProperty("asset_id")
    private String id;

    @NotBlank
    @JsonProperty("asset_name")
    private String name;

    @JsonProperty("asset_executor")
    private String executor;

    @JsonProperty("asset_tags")
    private Set<String> tags;

    @JsonProperty("asset_active")
    private boolean active;
}
