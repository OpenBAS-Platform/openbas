package io.openex.injects.mastodon.model;

public record MastodonAttachment(String name, byte[] data, String contentType) {
    // Nothing special
}
