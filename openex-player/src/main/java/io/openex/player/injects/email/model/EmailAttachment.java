package io.openex.player.injects.email.model;

public class EmailAttachment {

    private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";

    private final String name;

    private final byte[] data;

    private final String contentType;

    public EmailAttachment(String name, byte[] data, String contentType) {
        this.name = name;
        this.data = data;
        this.contentType = contentType != null ? contentType : DEFAULT_CONTENT_TYPE;
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
