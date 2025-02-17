package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import io.openbas.utils.TargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InjectTargetWithResult {

  @NotBlank private final String id;

  private final String name;

  private final List<ExpectationResultsByType> expectationResultsByTypes;

  private final List<InjectTargetWithResult> children = new ArrayList<>();

  @NotBlank private final TargetType targetType;

  private final PLATFORM_TYPE platformType;

  private final String executorType;

  public InjectTargetWithResult(
      @NotNull TargetType targetType,
      @NotNull String id,
      @NotNull String name,
      @NotNull List<ExpectationResultsByType> expectationResultsByTypes,
      @NotNull List<InjectTargetWithResult> children,
      PLATFORM_TYPE platformType,
      String executorType) {
    this.targetType = targetType;
    this.platformType = platformType;
    this.id = id;
    this.name = name;
    this.expectationResultsByTypes = expectationResultsByTypes;
    this.executorType = executorType;
    this.children.addAll(children);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    InjectTargetWithResult that = (InjectTargetWithResult) o;
    return Objects.equals(id, that.id);
  }
}
