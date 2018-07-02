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
	
	public Contract mandatory(String field) {
		fields.add(new ContractField(field, Text));
		return this;
	}
	
	public Contract optional(String field) {
		fields.add(new ContractField(field, Text, false));
		return this;
	}
	
	public Contract mandatory(String field, ContractType type) {
		fields.add(new ContractField(field, type));
		return this;
	}
	
	public Contract optional(String field, ContractType type) {
		fields.add(new ContractField(field, type, false));
		return this;
	}
	
	public Contract mandatory(String field, ContractType type, ContractCardinality cardinality) {
		fields.add(new ContractField(field, type, cardinality));
		return this;
	}
	
	public Contract optional(String field, ContractType type, ContractCardinality cardinality) {
		fields.add(new ContractField(field, type, cardinality, false));
		return this;
	}
	
	public List<ContractField> getFields() {
		return fields;
	}
}
