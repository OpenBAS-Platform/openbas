package io.openbas.database.model;

public enum ResourceType {
  ASSET,
  SCENARIO,
  SIMULATION,
  PLAYER,
  TEAM,
  ATOMIC_TESTING,
  NOTIFICATION_RULE,
  PAYLOAD,
  RESOURCE_TYPE,
  SECURITY_PLATFORM,
  DOCUMENT,
  CHANNEL,
  FINDING,
  DASHBOARD,
  PLATFORM_SETTING,
  LESSON_LEARNED,
  CHALLENGE,

  // Special resource types
  SIMULATION_OR_SCENARIO, // Used to represent either a simulation or a scenario.
  SKIP_RBAC, // Used to skip RBAC checks.
}
