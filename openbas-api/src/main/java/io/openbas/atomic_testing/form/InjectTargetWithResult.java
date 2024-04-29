package io.openbas.atomic_testing.form;

import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.TargetType;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;

@Getter
public class InjectTargetWithResult {

  private final TargetType targetType;
  private final String id;
  private final String name;
  private final List<ExpectationResultsByType> expectationResultsByTypes;
  private final List<InjectTargetWithResult> children = new ArrayList<>();

  public InjectTargetWithResult(@NotNull TargetType targetType, @NotNull String id, @NotNull String name, @NotNull List<ExpectationResultsByType> expectationResultsByTypes,
      @NotNull List<InjectTargetWithResult> children) {
    this.targetType = targetType;
    this.id = id;
    this.name = name;
    this.expectationResultsByTypes = expectationResultsByTypes;
    this.children.addAll(children);
  }

  public InjectTargetWithResult(TargetType targetType, String id, String name, List<ExpectationResultsByType> expectationResultsByTypes) {
    this.targetType = targetType;
    this.id = id;
    this.name = name;
    this.expectationResultsByTypes = expectationResultsByTypes;
  }
}
