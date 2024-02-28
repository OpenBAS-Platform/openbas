package io.openbas.contract.fields;

import io.openbas.contract.ContractCardinality;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
public abstract class ContractCardinalityElement extends ContractElement {

  private final ContractCardinality cardinality;

  @Setter
  private List<String> defaultValue = new ArrayList<>();

  public ContractCardinalityElement(String key, String label, ContractCardinality cardinality) {
    super(key, label);
    this.cardinality = cardinality;
  }

}
