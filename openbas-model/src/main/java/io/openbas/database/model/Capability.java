package io.openbas.database.model;

import static java.util.Map.entry;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public enum Capability {

  // Superuser
  BYPASS(pair(null, null)),

  // Atomic Testing
  ACCESS_ATOMIC_TESTING(pair(ResourceType.ATOMIC_TESTING, Action.READ)),
  MANAGE_ATOMIC_TESTING(pair(ResourceType.ATOMIC_TESTING, Action.WRITE)),
  DELETE_ATOMIC_TESTING(pair(ResourceType.ATOMIC_TESTING, Action.DELETE)),
  LAUNCH_ATOMIC_TESTING(pair(ResourceType.ATOMIC_TESTING, Action.LAUNCH)),

  // Teams & Players
  MANAGE_TEAMS_AND_PLAYERS(
      pair(ResourceType.TEAM, Action.WRITE), pair(ResourceType.PLAYER, Action.WRITE)),
  DELETE_TEAMS_AND_PLAYERS(
      pair(ResourceType.TEAM, Action.DELETE), pair(ResourceType.PLAYER, Action.DELETE)),

  // Assets (Endpoints, Groups)
  ACCESS_ASSETS(pair(ResourceType.ASSET, Action.READ)),
  MANAGE_ASSETS(pair(ResourceType.ASSET, Action.WRITE)),
  DELETE_ASSETS(pair(ResourceType.ASSET, Action.DELETE)),

  // Payloads
  ACCESS_PAYLOADS(pair(ResourceType.PAYLOAD, Action.READ)),
  MANAGE_PAYLOADS(pair(ResourceType.PAYLOAD, Action.WRITE)),
  DELETE_PAYLOADS(pair(ResourceType.PAYLOAD, Action.DELETE)),

  // Dashboards
  ACCESS_DASHBOARDS(pair(ResourceType.DASHBOARD, Action.READ)),
  MANAGE_DASHBOARDS(pair(ResourceType.DASHBOARD, Action.WRITE)),
  DELETE_DASHBOARDS(pair(ResourceType.DASHBOARD, Action.DELETE)),

  // Findings
  ACCESS_FINDINGS(pair(ResourceType.FINDING, Action.READ)),
  MANAGE_FINDINGS(pair(ResourceType.FINDING, Action.WRITE)),
  DELETE_FINDINGS(pair(ResourceType.FINDING, Action.DELETE)),

  // Documents
  ACCESS_DOCUMENTS(pair(ResourceType.DOCUMENT, Action.READ)),
  MANAGE_DOCUMENTS(pair(ResourceType.DOCUMENT, Action.WRITE)),
  DELETE_DOCUMENTS(pair(ResourceType.DOCUMENT, Action.DELETE)),

  // Channels
  ACCESS_CHANNELS(pair(ResourceType.CHANNEL, Action.READ)),
  MANAGE_CHANNELS(pair(ResourceType.CHANNEL, Action.WRITE)),
  DELETE_CHANNELS(pair(ResourceType.CHANNEL, Action.DELETE)),

  // Challenges
  ACCESS_CHALLENGES(pair(ResourceType.CHALLENGE, Action.READ)),
  MANAGE_CHALLENGES(pair(ResourceType.CHALLENGE, Action.WRITE)),
  DELETE_CHALLENGES(pair(ResourceType.CHALLENGE, Action.DELETE)),

  // Lessons Learned
  ACCESS_LESSONS_LEARNED(pair(ResourceType.LESSON_LEARNED, Action.READ)),
  MANAGE_LESSONS_LEARNED(pair(ResourceType.LESSON_LEARNED, Action.WRITE)),
  DELETE_LESSONS_LEARNED(pair(ResourceType.LESSON_LEARNED, Action.DELETE)),

  // Security Platforms
  ACCESS_SECURITY_PLATFORMS(pair(ResourceType.SECURITY_PLATFORM, Action.READ)),
  MANAGE_SECURITY_PLATFORMS(pair(ResourceType.SECURITY_PLATFORM, Action.WRITE)),
  DELETE_SECURITY_PLATFORMS(pair(ResourceType.SECURITY_PLATFORM, Action.DELETE)),

  // Platform Settings
  ACCESS_PLATFORM_SETTINGS(pair(ResourceType.PLATFORM_SETTING, Action.READ)),
  MANAGE_PLATFORM_SETTINGS(pair(ResourceType.PLATFORM_SETTING, Action.WRITE));

  private record ResourceTypeActionPair(ResourceType resource, Action action) {}

  private static ResourceTypeActionPair pair(ResourceType r, Action a) {
    return new ResourceTypeActionPair(r, a);
  }

  private final Set<ResourceTypeActionPair> pairs;

  Capability(ResourceTypeActionPair... pairs) {
    this.pairs = Set.of(pairs);
  }

  private static final Map<ResourceTypeActionPair, Capability> LOOKUP =
      Arrays.stream(values())
          .flatMap(cap -> cap.pairs.stream().map(k -> entry(k, cap)))
          .collect(Collectors.toUnmodifiableMap(Map.Entry::getKey, Map.Entry::getValue));

  public static Optional<Capability> of(ResourceType resource, Action action) {
    return Optional.ofNullable(LOOKUP.get(new ResourceTypeActionPair(resource, action)));
  }
}
