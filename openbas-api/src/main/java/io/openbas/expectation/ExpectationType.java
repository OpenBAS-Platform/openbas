package io.openbas.expectation;

public enum ExpectationType {
  DETECTION("Detected", "Pending", "Partially Detected", "Not Detected"),
  HUMAN_RESPONSE("Successful", "Pending", "Partial", "Failed"),
  PREVENTION("Blocked", "Pending", "Partially Prevented", "Not Prevented");

  public final String successLabel;
  public final String pendingLabel;
  public final String partialLabel;
  public final String failureLabel;

  ExpectationType(String successLabel, String pendingLabel, String partialLabel, String failureLabel) {
    this.successLabel = successLabel;
    this.pendingLabel = pendingLabel;
    this.partialLabel = partialLabel;
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
