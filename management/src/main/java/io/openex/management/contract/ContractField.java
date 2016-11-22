package io.openex.management.contract;

public class ContractField {
	
	private String name;
	
	private ContractType type;
	
	private ContractCardinality cardinality;
	
	public ContractField(String name, ContractType type) {
		this(name, type, ContractCardinality.One);
	}
	
	public ContractField(String name, ContractType type, ContractCardinality cardinality) {
		this.name = name;
		this.type = type;
		this.cardinality = cardinality;
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
}
