package io.openex.management.rest;

import io.openex.management.contract.ContractField;

import java.util.ArrayList;
import java.util.List;

class RestContract {
	
	private String type;
	
	private List<ContractField> fields = new ArrayList<>();
	
	RestContract(String type, List<ContractField> fields) {
		this.type = type;
		this.fields = fields;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	public List<ContractField> getFields() {
		return fields;
	}
	
	public void setFields(List<ContractField> fields) {
		this.fields = fields;
	}
}
