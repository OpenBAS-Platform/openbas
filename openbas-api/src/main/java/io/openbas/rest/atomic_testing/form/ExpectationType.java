package io.openbas.rest.atomic_testing.form;

public enum ExpectationType {
  PREVENTION("Blocked", "Unblocked"),
  DETECTION("Detected", "Undetected"),
  HUMAN_RESPONSE("Successful", "Failed");

  public final String successLabel;
  public final String failureLabel;

  ExpectationType(String successLabel, String failureLabel) {
    this.successLabel = successLabel;
    this.failureLabel = failureLabel;
  }
}
