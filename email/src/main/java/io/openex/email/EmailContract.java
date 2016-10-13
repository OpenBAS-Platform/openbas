package io.openex.email;

import io.openex.management.contract.Contract;

import java.util.List;

/**
 * Created by Julien on 13/10/2016.
 */
public class EmailContract extends Contract {
	
	private List<String> receivers;
	
	private String body;
	
	public List<String> getReceivers() {
		return receivers;
	}
	
	public void setReceivers(List<String> receivers) {
		this.receivers = receivers;
	}
	
	public String getBody() {
		return body;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
}
