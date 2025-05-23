package io.openbas.injector_contract.fields;

import static io.openbas.database.model.InjectorContract.CONTACT_ELEMENT_CONTENT_KEY_EXPECTATIONS;
import static io.openbas.injector_contract.ContractCardinality.Multiple;

import io.openbas.model.inject.form.Expectation;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;

@Getter
public class ContractExpectations extends ContractCardinalityElement {

  List<Expectation> predefinedExpectations;

  private ContractExpectations(@NotNull final List<Expectation> expectations) {
    super(CONTACT_ELEMENT_CONTENT_KEY_EXPECTATIONS, "Expectations", Multiple);
    this.predefinedExpectations = expectations;
  }

  public static ContractExpectations expectationsField() {
    return new ContractExpectations(List.of());
  }

  public static ContractExpectations expectationsField(
      @NotEmpty final List<Expectation> expectations) {
    return new ContractExpectations(expectations);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Expectation;
  }
}
