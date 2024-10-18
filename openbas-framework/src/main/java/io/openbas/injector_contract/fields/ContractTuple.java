package io.openbas.injector_contract.fields;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.injector_contract.ContractCardinality;
import io.openbas.injector_contract.ContractType;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ContractTuple extends ContractCardinalityElement {

  public static final String FILE_PREFIX = "file :: ";

  private String attachmentKey;

  public ContractTuple(String key, String label, ContractCardinality cardinality) {
    super(key, label, cardinality);
  }

  public static ContractTuple tupleField(String key, String label) {
    return new ContractTuple(key, label, ContractCardinality.Multiple);
  }

  public static ContractTuple tupleField(
      String key, String label, ContractAttachment attachmentContract) {
    ContractTuple contractTuple = new ContractTuple(key, label, ContractCardinality.Multiple);
    contractTuple.setAttachmentKey(attachmentContract.getKey());
    return contractTuple;
  }

  @Override
  public ContractType getType() {
    return ContractType.Tuple;
  }

  public Boolean isContractAttachment() {
    return attachmentKey != null;
  }

  @JsonProperty("tupleFilePrefix")
  public String tupleFilePrefix() {
    return FILE_PREFIX;
  }
}
