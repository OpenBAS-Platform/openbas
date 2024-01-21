package io.openex.rest.attack_pattern.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
public class AttackPatternCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("attack_pattern_name")
    private String name;

    @JsonProperty("attack_pattern_description")
    private String description;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("attack_pattern_external_id")
    private String externalId;

    @JsonProperty("attack_pattern_platforms")
    private List<String> platforms = new ArrayList<>();

    @JsonProperty("attack_pattern_permissions_required")
    private List<String> permissionsRequired = new ArrayList<>();

    @JsonProperty("attack_pattern_kill_chain_phases")
    private List<String> killChainPhasesIds = new ArrayList<>();

    @JsonProperty("attack_pattern_parent")
    private String parentId;

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public void setPermissionsRequired(List<String> permissionsRequired) {
        this.permissionsRequired = permissionsRequired;
    }

    public void setKillChainPhasesIds(List<String> killChainPhasesIds) {
        this.killChainPhasesIds = killChainPhasesIds;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
}
