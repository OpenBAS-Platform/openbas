package io.openbas.atomic_testing;

public enum ExpectationType {
  PREVENTION("Blocked", "Pending", "Unblocked"),
  DETECTION("Detected", "Pending", "Undetected"),
  HUMAN_RESPONSE("Successful", "Pending", "Failed");

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
