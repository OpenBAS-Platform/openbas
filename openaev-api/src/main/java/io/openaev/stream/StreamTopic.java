package io.openaev.stream;

import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * A topic a socket can watch: a {@link Kind} and, for an entity kind, the id of the row it names.
 * An invalidation carries the topic only, never data: the client refetches through the regular,
 * permission-checked endpoints.
 *
 * <p>Two shapes exist on the wire:
 *
 * <ul>
 *   <li>a list, e.g. {@code list:scenarios}, granted only to users who may see the whole list;
 *   <li>an entity, e.g. {@code atomic-testing:<uuid>}, {@code scenario:<uuid>}, {@code
 *       simulation:<uuid>}, {@code asset:<uuid>}, {@code asset-group:<uuid>}, {@code
 *       finding:<uuid>}, {@code team:<uuid>}, {@code person:<uuid>}, {@code organization:<uuid>},
 *       {@code payload:<uuid>}, {@code credential:<uuid>}, {@code dashboard:<uuid>} or {@code
 *       report:<uuid>}, granted to users who may read that row.
 * </ul>
 *
 * @param kind what the topic stands for
 * @param id the row an entity topic names; {@code null} for a list
 */
public record StreamTopic(Kind kind, String id) {

  static final int MAX_LENGTH = 128;

  /** Lower-case segments separated by colons, e.g. {@code list:scenarios}. */
  private static final Pattern SHAPE = Pattern.compile("[a-z][a-z0-9-]*(:[a-z0-9-]+)+");

  /** The id of an entity topic: a lower-case UUID. */
  private static final Pattern ENTITY_ID =
      Pattern.compile("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");

  /** The kinds of topic this server knows. */
  public enum Kind {
    LIST_SCENARIOS("list:scenarios", false),
    LIST_ATOMIC_TESTINGS("list:atomic-testings", false),
    LIST_SIMULATIONS("list:simulations", false),
    LIST_ASSETS("list:assets", false),
    LIST_ASSET_GROUPS("list:asset-groups", false),
    LIST_FINDINGS("list:findings", false),
    LIST_INTEGRATIONS("list:integrations", false),
    LIST_TEAMS("list:teams", false),
    LIST_PERSONS("list:persons", false),
    LIST_ORGANIZATIONS("list:organizations", false),
    LIST_PAYLOADS("list:payloads", false),
    LIST_CREDENTIALS("list:credentials", false),
    LIST_COMPONENTS("list:components", false),
    LIST_DASHBOARDS("list:dashboards", false),
    LIST_REPORTS("list:reports", false),
    LIST_ANALYTICS("list:analytics", false),
    ATOMIC_TESTING("atomic-testing", true),
    SCENARIO("scenario", true),
    SIMULATION("simulation", true),
    ASSET("asset", true),
    ASSET_GROUP("asset-group", true),
    FINDING("finding", true),
    TEAM("team", true),
    PERSON("person", true),
    ORGANIZATION("organization", true),
    PAYLOAD("payload", true),
    CREDENTIAL("credential", true),
    DASHBOARD("dashboard", true),
    REPORT("report", true);

    private final String prefix;
    private final boolean entity;

    Kind(String prefix, boolean entity) {
      this.prefix = prefix;
      this.entity = entity;
    }

    /** Whether topics of this kind name one row (and carry its id). */
    public boolean isEntity() {
      return entity;
    }
  }

  public static final StreamTopic LIST_SCENARIOS = new StreamTopic(Kind.LIST_SCENARIOS, null);
  public static final StreamTopic LIST_ATOMIC_TESTINGS =
      new StreamTopic(Kind.LIST_ATOMIC_TESTINGS, null);
  public static final StreamTopic LIST_SIMULATIONS = new StreamTopic(Kind.LIST_SIMULATIONS, null);
  public static final StreamTopic LIST_ASSETS = new StreamTopic(Kind.LIST_ASSETS, null);
  public static final StreamTopic LIST_ASSET_GROUPS = new StreamTopic(Kind.LIST_ASSET_GROUPS, null);
  public static final StreamTopic LIST_FINDINGS = new StreamTopic(Kind.LIST_FINDINGS, null);

  /**
   * Every integration screen at once: injectors and their contracts, collectors, executors,
   * connector instances (deployed, catalog, logs), secrets providers, and their detail pages.
   */
  public static final StreamTopic LIST_INTEGRATIONS = new StreamTopic(Kind.LIST_INTEGRATIONS, null);

  public static final StreamTopic LIST_TEAMS = new StreamTopic(Kind.LIST_TEAMS, null);

  /** The persons (players and users) of the tenant. */
  public static final StreamTopic LIST_PERSONS = new StreamTopic(Kind.LIST_PERSONS, null);

  public static final StreamTopic LIST_ORGANIZATIONS =
      new StreamTopic(Kind.LIST_ORGANIZATIONS, null);

  /**
   * The threat arsenal: payloads and the other entries listed with them (every injector contract,
   * payload-based or native).
   */
  public static final StreamTopic LIST_PAYLOADS = new StreamTopic(Kind.LIST_PAYLOADS, null);

  public static final StreamTopic LIST_CREDENTIALS = new StreamTopic(Kind.LIST_CREDENTIALS, null);

  /**
   * Every components screen at once: documents, channels, challenges, phishing landing pages and
   * email templates, lessons templates, and their detail pages.
   */
  public static final StreamTopic LIST_COMPONENTS = new StreamTopic(Kind.LIST_COMPONENTS, null);

  /** The custom dashboards of the tenant. */
  public static final StreamTopic LIST_DASHBOARDS = new StreamTopic(Kind.LIST_DASHBOARDS, null);

  /** The reportings of the tenant, with their generations and schedules. */
  public static final StreamTopic LIST_REPORTS = new StreamTopic(Kind.LIST_REPORTS, null);

  /**
   * The search engine has indexed new or changed data of the tenant (or removed some from the
   * index): every widget data query (custom dashboards, home dashboard, simulation statistics) is
   * stale. It names no row, no index and no entity type.
   */
  public static final StreamTopic LIST_ANALYTICS = new StreamTopic(Kind.LIST_ANALYTICS, null);

  public StreamTopic {
    Objects.requireNonNull(kind, "kind");
    if (kind.isEntity() != (id != null)) {
      throw new IllegalArgumentException(
          kind.isEntity() ? "an entity topic needs an id" : "a list topic has no id");
    }
  }

  /** The topic of one atomic testing's screen. */
  public static StreamTopic atomicTesting(String injectId) {
    return new StreamTopic(Kind.ATOMIC_TESTING, injectId);
  }

  /** The topic of one scenario's screen (overview, tabs and header). */
  public static StreamTopic scenario(String scenarioId) {
    return new StreamTopic(Kind.SCENARIO, scenarioId);
  }

  /** The topic of one simulation's screen (header, overview, tabs, animation and lessons). */
  public static StreamTopic simulation(String exerciseId) {
    return new StreamTopic(Kind.SIMULATION, exerciseId);
  }

  /**
   * The topic of one asset's screen (overview, agents, findings, injects played and posture), for
   * any asset type the inventory lists.
   */
  public static StreamTopic asset(String assetId) {
    return new StreamTopic(Kind.ASSET, assetId);
  }

  /** The topic of one asset group's screen (members, dynamic filter results, injects). */
  public static StreamTopic assetGroup(String assetGroupId) {
    return new StreamTopic(Kind.ASSET_GROUP, assetGroupId);
  }

  /** The topic of one finding's screen (occurrences, vulnerability panel). */
  public static StreamTopic finding(String findingId) {
    return new StreamTopic(Kind.FINDING, findingId);
  }

  /** The topic of one team's screen (its members and the injects played on it). */
  public static StreamTopic team(String teamId) {
    return new StreamTopic(Kind.TEAM, teamId);
  }

  /** The topic of one person's screen (a player or user of the tenant). */
  public static StreamTopic person(String userId) {
    return new StreamTopic(Kind.PERSON, userId);
  }

  /** The topic of one organization's screen. */
  public static StreamTopic organization(String organizationId) {
    return new StreamTopic(Kind.ORGANIZATION, organizationId);
  }

  /**
   * The topic of one threat arsenal entry's screen (overview and drawer), named by the id of the
   * injector contract the threat arsenal shows it as (its {@code action_id}, the id {@code GET
   * /api/threat_arsenals/{id}} takes), payload-based or native.
   */
  public static StreamTopic payload(String injectorContractId) {
    return new StreamTopic(Kind.PAYLOAD, injectorContractId);
  }

  /** The topic of one credential's screen. */
  public static StreamTopic credential(String credentialId) {
    return new StreamTopic(Kind.CREDENTIAL, credentialId);
  }

  /** The topic of one custom dashboard's definition (its widgets, layout and parameters). */
  public static StreamTopic dashboard(String customDashboardId) {
    return new StreamTopic(Kind.DASHBOARD, customDashboardId);
  }

  /** The topic of one reporting's page (its generations, preview and schedules). */
  public static StreamTopic report(String reportingId) {
    return new StreamTopic(Kind.REPORT, reportingId);
  }

  /** Whether this topic names one row rather than a list. */
  public boolean isEntity() {
    return kind.isEntity();
  }

  /** The topic as written on the wire. */
  public String getValue() {
    return kind.isEntity() ? kind.prefix + ":" + id : kind.prefix;
  }

  /**
   * Whether {@code raw} has the shape of a topic, known or not. A well-formed unknown topic is
   * denied rather than treated as an error, so a newer client talking to this server keeps its
   * socket. Never throws.
   */
  public static boolean isWellFormed(String raw) {
    return raw != null && raw.length() <= MAX_LENGTH && SHAPE.matcher(raw).matches();
  }

  /**
   * The known topic {@code raw} names, or empty when it is malformed, unknown, or an entity topic
   * whose id is not a lower-case UUID. Never throws.
   */
  public static Optional<StreamTopic> parse(String raw) {
    if (!isWellFormed(raw)) {
      return Optional.empty();
    }
    for (Kind kind : Kind.values()) {
      if (!kind.isEntity()) {
        if (kind.prefix.equals(raw)) {
          return Optional.of(new StreamTopic(kind, null));
        }
      } else if (raw.startsWith(kind.prefix + ":")) {
        String id = raw.substring(kind.prefix.length() + 1);
        return ENTITY_ID.matcher(id).matches()
            ? Optional.of(new StreamTopic(kind, id))
            : Optional.empty();
      }
    }
    return Optional.empty();
  }

  @Override
  public String toString() {
    return getValue();
  }
}
