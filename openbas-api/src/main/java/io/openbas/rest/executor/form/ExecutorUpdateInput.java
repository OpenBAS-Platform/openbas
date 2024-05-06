package io.openbas.rest.executor.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ExecutorUpdateInput {

    @JsonProperty("executor_last_execution")
    private Instant lastExecution;
}
