package io.openbas.database.model;

public enum MainFocus {
  INCIDENT_RESPONSE("incident-response"),
  ENDPOINT_PROTECTION("endpoint-protection"),
  WEB_FILTERING("web-filtering"),
  STANDARD_OPERATING_PROCEDURE("standard-operating-procedure"),
  CRISIS_COMMUNICATION("crisis-communication"),
  STRATEGIC_REACTION("strategic-reaction");

  private final String value;

  MainFocus(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }

  @Override
  public String toString() {
    return value;
  }
}
