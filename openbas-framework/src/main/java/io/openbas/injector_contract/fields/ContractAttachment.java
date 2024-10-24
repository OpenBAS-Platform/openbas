package io.openbas.injector_contract.fields;

import io.openbas.injector_contract.ContractCardinality;
import io.openbas.injector_contract.ContractType;

public class ContractAttachment extends ContractCardinalityElement {

  public ContractAttachment(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractAttachment attachmentField(
      String key, String label, ContractCardinality cardinality) {
    return new ContractAttachment(key, label, cardinality);
  }

  @Override
  public ContractType getType() {
    return ContractType.Attachment;
  }
}
