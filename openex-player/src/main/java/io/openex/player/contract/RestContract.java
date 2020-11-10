package io.openex.player.contract;

import java.util.List;

public class RestContract {
	
	private String type;
	
	private List<ContractField> fields;
	
	public RestContract(String type, List<ContractField> fields) {
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
