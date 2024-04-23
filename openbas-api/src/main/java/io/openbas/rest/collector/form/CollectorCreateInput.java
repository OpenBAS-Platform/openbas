package io.openbas.rest.collector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class CollectorCreateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("collector_id")
    private String id;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("collector_name")
    private String name;

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("collector_type")
    private String type;

    @JsonProperty("collector_period")
    private int period;
}
