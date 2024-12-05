package io.openbas.database.model;

public enum ExecutionTraceStatus {
  SUCCESS,
  ERROR,
  MAYBE_PREVENTED,
  INFO,
  COMMAND_NOT_FOUND,
  COMMAND_CANNOT_BE_EXECUTED,
  WARNING,
  ASSET_INACTIVE,
}
