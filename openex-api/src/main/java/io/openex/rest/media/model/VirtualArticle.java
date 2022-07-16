package io.openex.rest.media.model;

import java.time.Instant;

public record VirtualArticle(Instant date, String id) {
    // Nothing to define outside the record
}
