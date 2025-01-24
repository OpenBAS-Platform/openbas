package io.openbas.rest.inject.form;

public enum InjectExecutionActionInput {
  prerequisite_check,
  prerequisite_execution,
  cleanup_execution,
  command_execution,
  dns_resolution,
  file_execution,
  file_drop,
  complete,
}
