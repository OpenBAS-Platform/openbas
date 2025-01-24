package io.openbas.database.model;

public enum ExecutionTraceAction {
  PREREQUISITE_CHECK,
  PREREQUISITE_EXECUTION,

  EXECUTION,

  CLEANUP_EXECUTION,
  COMPLETE, // when inject of one asset is finish, or of one user
  PROCESS_FINISH // inject is completely done
}
