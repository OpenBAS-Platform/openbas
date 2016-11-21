package io.openex.management.contract;

import java.util.ArrayList;
import java.util.List;

import static io.openex.management.contract.ContractType.Text;

public class Contract {
	
	private List<ContractField> fields = new ArrayList<>();
	
	private Contract() {
		//private constructor
	}
	
	public static Contract build() {
		return new Contract();
	}
	
	public Contract add(String field) {
		fields.add(new ContractField(field, Text));
		return this;
	}
	
	public Contract add(String field, ContractType type) {
		fields.add(new ContractField(field, type));
		return this;
	}
	
	public Contract add(String field, ContractType type, ContractCardinality cardinality) {
		fields.add(new ContractField(field, type, cardinality));
		return this;
	}
	
	public List<ContractField> getFields() {
		return fields;
	}
}
