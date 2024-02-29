package io.openbas.contract.fields;

import io.openbas.contract.ContractType;
import io.openbas.model.inject.form.Expectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

import static io.openbas.contract.ContractCardinality.Multiple;

@Getter
public class ContractExpectations extends ContractCardinalityElement {

  List<Expectation> predefinedExpectations;

  private ContractExpectations(
      @NotBlank final String key,
      @NotBlank final String label,
      @NotNull final List<Expectation> expectations) {
    super(key, label, Multiple);
    this.predefinedExpectations = expectations;
  }

  public static ContractExpectations expectationsField(
      @NotBlank final String key,
      @NotBlank final String label) {
    return new ContractExpectations(key, label, List.of());
  }

  public static ContractExpectations expectationsField(
      @NotBlank final String key,
      @NotBlank final String label,
      @NotEmpty final List<Expectation> expectations) {
    return new ContractExpectations(key, label, expectations);
  }

  @Override
  public ContractType getType() {
    return ContractType.Expectation;
  }

}
