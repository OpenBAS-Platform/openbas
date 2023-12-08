package io.openex.contract.fields;

import io.openex.contract.ContractType;

import javax.validation.constraints.NotBlank;

import static io.openex.contract.ContractCardinality.Multiple;

public class ContractManualExpectation extends ContractCardinalityElement {

  private ContractManualExpectation(
      @NotBlank final String key,
      @NotBlank final String label) {
    super(key, label, Multiple);
  }

  public static ContractManualExpectation manualExpectationField(
      @NotBlank final String key,
      @NotBlank final String label) {
    return new ContractManualExpectation(key, label);
  }

  @Override
  public ContractType getType() {
    return ContractType.Expectation;
  }
}
