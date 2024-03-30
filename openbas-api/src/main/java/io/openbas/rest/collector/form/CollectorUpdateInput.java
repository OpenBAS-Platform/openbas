package io.openbas.rest.collector.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class CollectorUpdateInput {

    @JsonProperty("collector_last_execution")
    private Instant lastExecution;
}
