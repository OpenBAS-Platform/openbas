package io.openex.sms.ovh;

import java.util.List;

import static io.openex.sms.ovh.OvhSmsProducer.UTF_8;

/**
 * Created by Julien on 07/01/2017.
 */
@SuppressWarnings({"WeakerAccess", "unused"})
public class OvhSmsMessage {
	
	private String charset = UTF_8;
	
	private List<String> receivers;
	
	private String message;
	
	private String coding = "8bit";
	
	private String priority = "high";

	private String sender = "OpenEx";
	
	private boolean senderForResponse = false;
	
	private boolean noStopClause = true;
	
	public OvhSmsMessage(List<String> receivers, String message) {
		this.receivers = receivers;
		this.message = message;
	}
	
	public String getMessage() {
		return message;
	}
	
	public String getCharset() {
		return charset;
	}
	
	public void setCharset(String charset) {
		this.charset = charset;
	}
	
	public List<String> getReceivers() {
		return receivers;
	}
	
	public String getCoding() {
		return coding;
	}
	
	public void setCoding(String coding) {
		this.coding = coding;
	}
	
	public String getPriority() { return priority; }
	
	public void setPriority(String priority) { this.priority = priority; }

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}
	
	public boolean isSenderForResponse() {
		return senderForResponse;
	}
	
	public void setSenderForResponse(boolean senderForResponse) {
		this.senderForResponse = senderForResponse;
	}
	
	public boolean isNoStopClause() {
		return noStopClause;
	}
	
	public void setNoStopClause(boolean noStopClause) {
		this.noStopClause = noStopClause;
	}
}
