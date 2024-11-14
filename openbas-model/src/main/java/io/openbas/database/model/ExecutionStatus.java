package io.openbas.database.model;

public enum ExecutionStatus {
  SUCCESS,
  ERROR,
  MAYBE_PREVENTED,
  DRAFT,
  QUEUING,
  EXECUTING,
  PENDING,
  PARTIAL,
  MAYBE_PARTIAL_PREVENTED,
}
