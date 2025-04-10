package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import lombok.Data;

import java.util.List;

@Data
public class BaseTarget {
    @JsonProperty("prevention_status")
    @Queryable(filterable = true, searchable = true, sortable = true)
    private String preventionStatus;
    private String detectionStatus;
    private String humanResponseStatus;
    @JsonProperty("execution_status")
    @Queryable(filterable = true, searchable = true, sortable = true)
    private ExecutionStatus executionStatus;
    private List<Tag> tags;
}
