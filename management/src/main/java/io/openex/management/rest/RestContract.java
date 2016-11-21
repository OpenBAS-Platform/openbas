package io.openex.management.rest;

import io.openex.management.contract.ContractField;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("ALL")
@XmlRootElement(name = "contracts")
@XmlAccessorType(XmlAccessType.FIELD)
public class RestContract {
	
	private String type;
	private List<ContractField> fields = new ArrayList<>();
	
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
