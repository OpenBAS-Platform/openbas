package io.openbas.model;

import io.openbas.injector_contract.ContractType;
import io.openbas.injector_contract.fields.ContractElement;

public class LinkedFieldModel {

  private String key;

  private ContractType type;

  private LinkedFieldModel(String key, ContractType type) {
    this.key = key;
    this.type = type;
  }

  public static LinkedFieldModel fromField(ContractElement fieldContract) {
    return new LinkedFieldModel(fieldContract.getKey(), fieldContract.getType());
  }

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public ContractType getType() {
    return type;
  }

  public void setType(ContractType type) {
    this.type = type;
  }
}
