package io.openbas.atomic_testing.form;

import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.TargetType;
import java.util.ArrayList;
import java.util.List;
import org.jetbrains.annotations.NotNull;

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

  public TargetType getTargetType() {
    return targetType;
  }

  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public List<ExpectationResultsByType> getExpectationResultsByTypes() {
    return expectationResultsByTypes;
  }

  public List<InjectTargetWithResult> getChildren() {
    return children;
  }
}
