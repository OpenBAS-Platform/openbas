package io.openbas.database.model;

public enum Action {
  READ,
  WRITE,
  LAUNCH,
  DELETE,
  SEARCH,
  CREATE,
  DUPLICATE,

  // Special actions for specific use cases
  SKIP_RBAC, // Used to skip RBAC checks in specific scenarios
}
