package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Setter
@Getter
public class InjectReceptionInput {

    @JsonProperty("tracking_total_count")
    private int trackingTotalCount;
}
