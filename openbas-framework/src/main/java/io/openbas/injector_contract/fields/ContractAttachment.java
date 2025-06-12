package io.openbas.injector_contract.fields;

import static io.openbas.database.model.InjectorContract.CONTRACT_ELEMENT_CONTENT_KEY_ATTACHMENTS;

import io.openbas.injector_contract.ContractCardinality;

public class ContractAttachment extends ContractCardinalityElement {

  public ContractAttachment(ContractCardinality cardinality) {
    super(CONTRACT_ELEMENT_CONTENT_KEY_ATTACHMENTS, "Attachments", cardinality);
  }

  public static ContractAttachment attachmentField(ContractCardinality cardinality) {
    return new ContractAttachment(cardinality);
  }

  @Override
  public ContractFieldType getType() {
    return ContractFieldType.Attachment;
  }
}
