package io.openex.player.contract;

public class ContractField {
	
	private String name;
	
	private ContractType type;
	
	private ContractCardinality cardinality;
	
	private boolean mandatory;
	
	ContractField(String name, ContractType type) {
		this(name, type, ContractCardinality.One, true);
	}
	
	ContractField(String name, ContractType type, ContractCardinality cardinality) {
		this(name, type, cardinality, true);
	}
	
	ContractField(String name, ContractType type, Boolean mandatory) {
		this(name, type, ContractCardinality.One, mandatory);
	}
	
	ContractField(String name, ContractType type, ContractCardinality cardinality, Boolean mandatory) {
		this.name = name;
		this.type = type;
		this.cardinality = cardinality;
		this.mandatory = mandatory;
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
}
