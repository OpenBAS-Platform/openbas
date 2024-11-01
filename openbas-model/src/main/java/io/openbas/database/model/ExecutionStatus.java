package io.openbas.database.model;

public enum ExecutionStatus {
  DRAFT,
  INFO,
  QUEUING,
  EXECUTING,
  PENDING,
  PARTIAL,
  ERROR,
  MAYBE_PARTIAL_PREVENTED,
  MAYBE_PREVENTED,
  SUCCESS
}
