package io.openbas.rest.helper;

import java.util.List;
import java.util.Map;

class ValidationContent {
  private List<String> errors;

  public ValidationContent(String error) {
    this.errors = List.of(error);
  }

  public List<String> getErrors() {
    return errors;
  }

  public void setErrors(List<String> errors) {
    this.errors = errors;
  }
}

class ValidationError {
  private Map<String, ValidationContent> children;

  public Map<String, ValidationContent> getChildren() {
    return children;
  }

  public void setChildren(Map<String, ValidationContent> children) {
    this.children = children;
  }
}

public class ValidationErrorBag {
  private int code = 400;
  private String message = "Validation Failed";
  private ValidationError errors;

  public ValidationErrorBag() {
    // Default constructor
  }

  public ValidationErrorBag(int code, String message) {
    this.code = code;
    this.message = message;
  }

  public int getCode() {
    return code;
  }

  public void setCode(int code) {
    this.code = code;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public ValidationError getErrors() {
    return errors;
  }

  public void setErrors(ValidationError errors) {
    this.errors = errors;
  }
}
