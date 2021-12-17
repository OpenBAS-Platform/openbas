package io.openex.injects.email.model;

public record EmailAttachment(String name, byte[] data, String contentType) {
    // Nothing special
}
