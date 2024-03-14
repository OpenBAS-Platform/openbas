package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class InjectStatusExecution {

    @JsonProperty("execution_time")
    private Instant time;

    @JsonProperty("execution_duration")
    private int duration;

    @JsonProperty("execution_message")
    private String message;

    @JsonProperty("execution_status")
    private ExecutionStatus status;

    @JsonProperty("execution_context_identifiers")
    private List<String> identifiers = new ArrayList<>();
}
