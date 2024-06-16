package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
@EqualsAndHashCode(callSuper = true)
public class EndpointRegisterInput extends EndpointInput {

    @NotNull(message = MANDATORY_MESSAGE)
    @JsonProperty("asset_external_reference")
    private String externalReference;
}
