package io.openbas.database.model;

public record DataAttachment(String id, String name, byte[] data, String contentType) {
  // Nothing special
}
