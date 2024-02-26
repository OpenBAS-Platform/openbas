package io.openex.rest.group.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Setter
@Getter
public class OrganizationGrantInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("organization_id")
    private String organizationId;

}
