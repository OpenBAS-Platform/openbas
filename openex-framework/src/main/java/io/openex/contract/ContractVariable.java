package io.openex.contract;

import lombok.Getter;

import java.util.List;
import io.openex.database.model.Variable.VariableType;

@Getter
public class ContractVariable {

  private final String key;

  private final String label;

  private final VariableType type;

  private final ContractCardinality cardinality;

  private final List<ContractVariable> children;

  private ContractVariable(
      final String key,
      final String label,
      final VariableType type,
      final ContractCardinality cardinality,
      final List<ContractVariable> children) {
    this.key = key;
    this.label = label;
    this.type = type;
    this.cardinality = cardinality;
    this.children = children;
  }

  public static ContractVariable variable(
      final String key,
      final String label,
      final VariableType type,
      final ContractCardinality cardinality) {
    return new ContractVariable(key, label, type, cardinality, List.of());
  }

  public static ContractVariable variable(
      final String key,
      final String label,
      final VariableType type,
      final ContractCardinality cardinality,
      final List<ContractVariable> children) {
    return new ContractVariable(key, label, type, cardinality, children);
  }

}
