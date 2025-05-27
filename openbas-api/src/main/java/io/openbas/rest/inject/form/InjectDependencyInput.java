package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InjectDependencyInput {

  @JsonProperty("dependency_relationship")
  private InjectDependencyIdInput relationship;

  @JsonProperty("dependency_condition")
  private InjectDependencyConditions.InjectDependencyCondition conditions;

  @JsonProperty("dependency_bindings")
  private List<InjectBinding> bindings = new ArrayList<>();

  public InjectDependency toInjectDependency(
      @NotNull final Inject inject, @NotNull final Inject injectParent) {
    InjectDependency dependency = new InjectDependency();
    dependency.setInjectDependencyCondition(this.getConditions());
    dependency.setBindings(this.getBindings());
    dependency.setCompositeId(new InjectDependencyId());
    dependency.getCompositeId().setInjectChildren(inject);
    dependency.getCompositeId().setInjectParent(injectParent);
    return dependency;
  }
}
