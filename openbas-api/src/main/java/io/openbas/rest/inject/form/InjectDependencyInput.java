package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.*;
import jakarta.persistence.EmbeddedId;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class InjectDependencyInput {

    @JsonProperty("dependency_parent")
    private String injectParent;

    @JsonProperty("dependency_mode")
    private InjectDependencyConditions.DependencyMode mode;

    @JsonProperty("dependency_conditions")
    private List<InjectDependencyConditions.Condition> conditions;

    public InjectDependencyConditions.InjectDependencyCondition toInjectDependency() {
        InjectDependencyConditions.InjectDependencyCondition injectDependency = new InjectDependencyConditions.InjectDependencyCondition();
        injectDependency.setMode(getMode());
        injectDependency.setConditions(getConditions());
        return injectDependency;
    }

}
