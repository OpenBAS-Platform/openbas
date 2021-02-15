package io.openex.player.injects.ovh_sms.service;

import java.util.List;

public class OvhSmsMessage {

	private String charset = "UTF-8";

	private final List<String> receivers;

	private final String message;

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
