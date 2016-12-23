package io.openex.email.attachment;

/**
 * Created by Julien on 23/12/2016.
 */
public class EmailAttachment {
	
	private String name;
	
	private byte[] data;
	
	private String contentType;
	
	public EmailAttachment(String name, byte[] data, String contentType) {
		this.name = name;
		this.data = data;
		this.contentType = contentType;
	}
	
	public String getName() {
		return name;
	}
	
	public byte[] getData() {
		return data;
	}
	
	public String getContentType() {
		return contentType;
	}
}
