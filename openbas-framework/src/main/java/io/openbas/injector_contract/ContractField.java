package io.openbas.injector_contract;

public class ContractField {

  private String name;

  private ContractType type;

  private boolean mandatory;

  private boolean readOnly;

  private ContractCardinality cardinality;

  ContractField(
      String name,
      ContractType type,
      ContractCardinality cardinality,
      Boolean mandatory,
      Boolean readOnly) {
    this.name = name;
    this.type = type;
    this.cardinality = cardinality;
    this.mandatory = mandatory;
    this.readOnly = readOnly;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public ContractType getType() {
    return type;
  }

  public void setType(ContractType type) {
    this.type = type;
  }

  public ContractCardinality getCardinality() {
    return cardinality;
  }

  public void setCardinality(ContractCardinality cardinality) {
    this.cardinality = cardinality;
  }

  public boolean isMandatory() {
    return mandatory;
  }

  public void setMandatory(boolean mandatory) {
    this.mandatory = mandatory;
  }

  public boolean isReadOnly() {
    return readOnly;
  }

  public void setReadOnly(boolean readOnly) {
    this.readOnly = readOnly;
  }
}
