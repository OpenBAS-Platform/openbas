package io.openbas.rest.attack_pattern.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

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
    private String[] platforms = new String[0];

    @JsonProperty("attack_pattern_permissions_required")
    private String[] permissionsRequired = new String[0];

    @JsonProperty("attack_pattern_kill_chain_phases")
    private List<String> killChainPhasesIds = new ArrayList<>();

    @JsonProperty("attack_pattern_parent")
    private String parentId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String[] getPlatforms() {
        return platforms;
    }

    public void setPlatforms(String[] platforms) {
        this.platforms = platforms;
    }

    public String[] getPermissionsRequired() {
        return permissionsRequired;
    }

    public void setPermissionsRequired(String[] permissionsRequired) {
        this.permissionsRequired = permissionsRequired;
    }

    public List<String> getKillChainPhasesIds() {
        return killChainPhasesIds;
    }

    public void setKillChainPhasesIds(List<String> killChainPhasesIds) {
        this.killChainPhasesIds = killChainPhasesIds;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
}


