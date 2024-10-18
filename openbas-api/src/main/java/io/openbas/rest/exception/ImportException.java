package io.openbas.rest.exception;

public class ImportException extends Exception {

  private final String field;

  public ImportException(String field, String message) {
    super(message);
    this.field = field;
  }

  public String getField() {
    return field;
  }
}
