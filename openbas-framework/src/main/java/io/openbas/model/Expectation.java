package io.openbas.model;

import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;

public interface Expectation {

  EXPECTATION_TYPE type();

  Double getScore();

  default boolean isExpectationGroup() {
    return false;
  }

  String getName();

  /** Expiration time in seconds */
  Long getExpirationTime();
}
