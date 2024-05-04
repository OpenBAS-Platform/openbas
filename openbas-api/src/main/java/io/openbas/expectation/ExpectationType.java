package io.openbas.expectation;

public enum ExpectationType {
  DETECTION("Detected", "Pending", "Undetected"),
  HUMAN_RESPONSE("Successful", "Pending", "Failed"),
  PREVENTION("Blocked", "Pending", "Unblocked");

  public final String successLabel;
  public final String pendingLabel;
  public final String failureLabel;

  ExpectationType(String successLabel, String pendingLabel, String failureLabel) {
    this.successLabel = successLabel;
    this.pendingLabel = pendingLabel;
    this.failureLabel = failureLabel;
  }

  public static ExpectationType of(String value) {
    switch (value.toLowerCase()) {
      case "manual":
      case "article":
      case "challenge":
        return ExpectationType.HUMAN_RESPONSE;
      default:
        return valueOf(value);
    }
  }

}
