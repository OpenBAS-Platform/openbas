package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("StreamTopic: parsing a topic never throws")
class StreamTopicTest {

  private static final String INJECT_ID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

  @Test
  @DisplayName("list:scenarios is a known topic")
  void given_listScenarios_should_parseKnownTopic() {
    assertThat(StreamTopic.parse("list:scenarios")).contains(StreamTopic.LIST_SCENARIOS);
    assertThat(StreamTopic.isWellFormed("list:scenarios")).isTrue();
  }

  @ParameterizedTest
  @NullAndEmptySource
  @ValueSource(
      strings = {
        "list",
        "list:",
        ":scenarios",
        "LIST:SCENARIOS",
        "list:scenarios ",
        "list::scenarios",
        "list:scénarios",
        "list:scenarios\n",
        "{\"type\":\"x\"}",
        "1list:scenarios"
      })
  @DisplayName("a malformed topic is neither well formed nor known")
  void given_malformedTopic_should_beRejected(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.isWellFormed(raw)).isFalse();
    assertThat(StreamTopic.parse(raw)).isEmpty();
  }

  @Test
  @DisplayName("a topic over the length limit is rejected")
  void given_tooLongTopic_should_beRejected() {
    String tooLong = "list:" + "a".repeat(StreamTopic.MAX_LENGTH);

    assertThat(StreamTopic.isWellFormed(tooLong)).isFalse();
    assertThat(StreamTopic.parse(tooLong)).isEmpty();
  }

  @Test
  @DisplayName("a well-formed unknown topic is well formed but not known")
  void given_unknownTopic_should_beWellFormedButNotKnown() {
    assertThat(StreamTopic.isWellFormed("list:tags")).isTrue();
    assertThat(StreamTopic.parse("list:tags")).isEmpty();
    assertThat(StreamTopic.parse("detail:scenario:abc-123")).isEmpty();
    assertThat(StreamTopic.parse("tag:" + INJECT_ID)).isEmpty();
  }

  @Test
  @DisplayName("list:atomic-testings is a known list topic")
  void given_listAtomicTestings_should_parseKnownTopic() {
    assertThat(StreamTopic.parse("list:atomic-testings"))
        .contains(StreamTopic.LIST_ATOMIC_TESTINGS);
    assertThat(StreamTopic.LIST_ATOMIC_TESTINGS.isEntity()).isFalse();
    assertThat(StreamTopic.LIST_ATOMIC_TESTINGS.getValue()).isEqualTo("list:atomic-testings");
  }

  @Test
  @DisplayName("atomic-testing:<uuid> is an entity topic carrying the id")
  void given_atomicTestingTopic_should_parseEntityTopic() {
    StreamTopic topic = StreamTopic.parse("atomic-testing:" + INJECT_ID).orElseThrow();

    assertThat(topic.kind()).isEqualTo(StreamTopic.Kind.ATOMIC_TESTING);
    assertThat(topic.id()).isEqualTo(INJECT_ID);
    assertThat(topic.isEntity()).isTrue();
    assertThat(topic.getValue()).isEqualTo("atomic-testing:" + INJECT_ID);
    assertThat(topic).isEqualTo(StreamTopic.atomicTesting(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "atomic-testing:not-a-uuid",
        "atomic-testing:3f2504e0-4f89-11d3-9a0c-0305e82c330",
        "atomic-testing:3f2504e0-4f89-11d3-9a0c-0305e82c33011",
        "atomic-testing:3f2504e04f8911d39a0c0305e82c3301",
        "atomic-testing:" + INJECT_ID + ":extra"
      })
  @DisplayName("an entity topic whose id is not a lower-case UUID is well formed but not known")
  void given_badEntityId_should_beWellFormedButNotKnown(String raw) {
    assertThat(StreamTopic.isWellFormed(raw)).isTrue();
    assertThat(StreamTopic.parse(raw)).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = {"atomic-testing", "atomic-testing:", "ATOMIC-TESTING:" + INJECT_ID})
  @DisplayName("a malformed entity topic is rejected without throwing")
  void given_malformedEntityTopic_should_beRejected(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
  }

  @Test
  @DisplayName("an upper-case UUID is denied, the contract being lower case")
  void given_upperCaseUuid_should_notBeKnown() {
    assertThat(StreamTopic.parse("atomic-testing:" + INJECT_ID.toUpperCase())).isEmpty();
  }

  @Test
  @DisplayName("scenario:<uuid> is an entity topic carrying the id")
  void given_scenarioTopic_should_parseEntityTopic() {
    StreamTopic topic = StreamTopic.parse("scenario:" + INJECT_ID).orElseThrow();

    assertThat(topic.kind()).isEqualTo(StreamTopic.Kind.SCENARIO);
    assertThat(topic.id()).isEqualTo(INJECT_ID);
    assertThat(topic.isEntity()).isTrue();
    assertThat(topic.getValue()).isEqualTo("scenario:" + INJECT_ID);
    assertThat(topic).isEqualTo(StreamTopic.scenario(INJECT_ID));
    assertThat(topic).isNotEqualTo(StreamTopic.atomicTesting(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "scenario",
        "scenario:",
        "scenario:not-a-uuid",
        "scenario:" + INJECT_ID + ":extra",
        "SCENARIO:" + INJECT_ID,
        "scenarios:" + INJECT_ID
      })
  @DisplayName("a scenario topic without a lower-case UUID is not known")
  void given_badScenarioTopic_should_notBeKnown(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
    assertThat(StreamTopic.parse("scenario:" + INJECT_ID.toUpperCase())).isEmpty();
  }

  @Test
  @DisplayName("list:simulations is a known list topic")
  void given_listSimulations_should_parseKnownTopic() {
    assertThat(StreamTopic.parse("list:simulations")).contains(StreamTopic.LIST_SIMULATIONS);
    assertThat(StreamTopic.LIST_SIMULATIONS.isEntity()).isFalse();
    assertThat(StreamTopic.LIST_SIMULATIONS.getValue()).isEqualTo("list:simulations");
  }

  @Test
  @DisplayName("simulation:<uuid> is an entity topic carrying the id")
  void given_simulationTopic_should_parseEntityTopic() {
    StreamTopic topic = StreamTopic.parse("simulation:" + INJECT_ID).orElseThrow();

    assertThat(topic.kind()).isEqualTo(StreamTopic.Kind.SIMULATION);
    assertThat(topic.id()).isEqualTo(INJECT_ID);
    assertThat(topic.isEntity()).isTrue();
    assertThat(topic.getValue()).isEqualTo("simulation:" + INJECT_ID);
    assertThat(topic).isEqualTo(StreamTopic.simulation(INJECT_ID));
    assertThat(topic).isNotEqualTo(StreamTopic.scenario(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "simulation",
        "simulation:",
        "simulation:not-a-uuid",
        "simulation:" + INJECT_ID + ":extra",
        "SIMULATION:" + INJECT_ID,
        "simulations:" + INJECT_ID,
        "list:simulation"
      })
  @DisplayName("a simulation topic without a lower-case UUID is not known")
  void given_badSimulationTopic_should_notBeKnown(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
    assertThat(StreamTopic.parse("simulation:" + INJECT_ID.toUpperCase())).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = {"list:assets", "list:asset-groups", "list:findings"})
  @DisplayName("the asset, asset-group and finding lists are known list topics")
  void given_assetAndFindingLists_should_parseKnownTopics(String raw) {
    StreamTopic topic = StreamTopic.parse(raw).orElseThrow();

    assertThat(topic.isEntity()).isFalse();
    assertThat(topic.getValue()).isEqualTo(raw);
    assertThat(
            List.of(
                StreamTopic.LIST_ASSETS, StreamTopic.LIST_ASSET_GROUPS, StreamTopic.LIST_FINDINGS))
        .contains(topic);
  }

  @Test
  @DisplayName("asset:, asset-group: and finding:<uuid> are entity topics carrying the id")
  void given_assetAssetGroupAndFindingTopics_should_parseEntityTopics() {
    assertThat(StreamTopic.parse("asset:" + INJECT_ID)).contains(StreamTopic.asset(INJECT_ID));
    assertThat(StreamTopic.parse("asset-group:" + INJECT_ID))
        .contains(StreamTopic.assetGroup(INJECT_ID));
    assertThat(StreamTopic.parse("finding:" + INJECT_ID)).contains(StreamTopic.finding(INJECT_ID));
    assertThat(StreamTopic.asset(INJECT_ID).kind()).isEqualTo(StreamTopic.Kind.ASSET);
    assertThat(StreamTopic.assetGroup(INJECT_ID).getValue()).isEqualTo("asset-group:" + INJECT_ID);
    assertThat(StreamTopic.asset(INJECT_ID)).isNotEqualTo(StreamTopic.assetGroup(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "asset",
        "asset:",
        "asset:not-a-uuid",
        "asset:" + INJECT_ID + ":extra",
        "assets:" + INJECT_ID,
        "asset-group:not-a-uuid",
        "asset-groups:" + INJECT_ID,
        "finding:not-a-uuid",
        "findings:" + INJECT_ID,
        "list:asset",
        "list:finding"
      })
  @DisplayName("an asset, asset-group or finding topic without a lower-case UUID is not known")
  void given_badAssetOrFindingTopic_should_notBeKnown(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
    assertThat(StreamTopic.parse("asset:" + INJECT_ID.toUpperCase())).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = {"list:integrations", "list:teams", "list:persons", "list:organizations"})
  @DisplayName("the integration, team, person and organization lists are known list topics")
  void given_integrationTeamPersonAndOrganizationLists_should_parseKnownTopics(String raw) {
    StreamTopic topic = StreamTopic.parse(raw).orElseThrow();

    assertThat(topic.isEntity()).isFalse();
    assertThat(topic.getValue()).isEqualTo(raw);
    assertThat(
            List.of(
                StreamTopic.LIST_INTEGRATIONS,
                StreamTopic.LIST_TEAMS,
                StreamTopic.LIST_PERSONS,
                StreamTopic.LIST_ORGANIZATIONS))
        .contains(topic);
  }

  @Test
  @DisplayName("team:, person: and organization:<uuid> are entity topics carrying the id")
  void given_teamPersonAndOrganizationTopics_should_parseEntityTopics() {
    assertThat(StreamTopic.parse("team:" + INJECT_ID)).contains(StreamTopic.team(INJECT_ID));
    assertThat(StreamTopic.parse("person:" + INJECT_ID)).contains(StreamTopic.person(INJECT_ID));
    assertThat(StreamTopic.parse("organization:" + INJECT_ID))
        .contains(StreamTopic.organization(INJECT_ID));
    assertThat(StreamTopic.team(INJECT_ID).kind()).isEqualTo(StreamTopic.Kind.TEAM);
    assertThat(StreamTopic.person(INJECT_ID).getValue()).isEqualTo("person:" + INJECT_ID);
    assertThat(StreamTopic.team(INJECT_ID)).isNotEqualTo(StreamTopic.person(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "team",
        "team:",
        "team:not-a-uuid",
        "teams:" + INJECT_ID,
        "person:not-a-uuid",
        "persons:" + INJECT_ID,
        "organization:not-a-uuid",
        "organizations:" + INJECT_ID,
        "list:team",
        "list:integration",
        "list:integrations:" + INJECT_ID,
        "integration:" + INJECT_ID
      })
  @DisplayName("a team, person, organization or integration topic of the wrong shape is not known")
  void given_badTeamPersonOrganizationOrIntegrationTopic_should_notBeKnown(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
    assertThat(StreamTopic.parse("team:" + INJECT_ID.toUpperCase())).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = {"list:payloads", "list:credentials", "list:components"})
  @DisplayName("the threat arsenal, credential and components lists are known list topics")
  void given_payloadCredentialAndComponentLists_should_parseKnownTopics(String raw) {
    StreamTopic topic = StreamTopic.parse(raw).orElseThrow();

    assertThat(topic.isEntity()).isFalse();
    assertThat(topic.getValue()).isEqualTo(raw);
    assertThat(
            List.of(
                StreamTopic.LIST_PAYLOADS,
                StreamTopic.LIST_CREDENTIALS,
                StreamTopic.LIST_COMPONENTS))
        .contains(topic);
  }

  @Test
  @DisplayName("payload: and credential:<uuid> are entity topics carrying the id")
  void given_payloadAndCredentialTopics_should_parseEntityTopics() {
    assertThat(StreamTopic.parse("payload:" + INJECT_ID)).contains(StreamTopic.payload(INJECT_ID));
    assertThat(StreamTopic.parse("credential:" + INJECT_ID))
        .contains(StreamTopic.credential(INJECT_ID));
    assertThat(StreamTopic.payload(INJECT_ID).kind()).isEqualTo(StreamTopic.Kind.PAYLOAD);
    assertThat(StreamTopic.credential(INJECT_ID).getValue()).isEqualTo("credential:" + INJECT_ID);
    assertThat(StreamTopic.payload(INJECT_ID)).isNotEqualTo(StreamTopic.credential(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "payload",
        "payload:",
        "payload:not-a-uuid",
        "payloads:" + INJECT_ID,
        "credential:not-a-uuid",
        "credentials:" + INJECT_ID,
        "list:payload",
        "list:credential",
        "list:component",
        "list:components:" + INJECT_ID,
        "component:" + INJECT_ID,
        "document:" + INJECT_ID
      })
  @DisplayName("a payload, credential or component topic of the wrong shape is not known")
  void given_badPayloadCredentialOrComponentTopic_should_notBeKnown(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
    assertThat(StreamTopic.parse("payload:" + INJECT_ID.toUpperCase())).isEmpty();
  }

  @ParameterizedTest
  @ValueSource(strings = {"list:dashboards", "list:reports", "list:analytics"})
  @DisplayName("the dashboards, reports and analytics lists are known list topics")
  void given_dashboardReportAndAnalyticsLists_should_parseKnownTopics(String raw) {
    StreamTopic topic = StreamTopic.parse(raw).orElseThrow();

    assertThat(topic.isEntity()).isFalse();
    assertThat(topic.getValue()).isEqualTo(raw);
    assertThat(
            List.of(
                StreamTopic.LIST_DASHBOARDS, StreamTopic.LIST_REPORTS, StreamTopic.LIST_ANALYTICS))
        .contains(topic);
  }

  @Test
  @DisplayName("dashboard: and report:<uuid> are entity topics carrying the id")
  void given_dashboardAndReportTopics_should_parseEntityTopics() {
    assertThat(StreamTopic.parse("dashboard:" + INJECT_ID))
        .contains(StreamTopic.dashboard(INJECT_ID));
    assertThat(StreamTopic.parse("report:" + INJECT_ID)).contains(StreamTopic.report(INJECT_ID));
    assertThat(StreamTopic.dashboard(INJECT_ID).kind()).isEqualTo(StreamTopic.Kind.DASHBOARD);
    assertThat(StreamTopic.report(INJECT_ID).getValue()).isEqualTo("report:" + INJECT_ID);
    assertThat(StreamTopic.dashboard(INJECT_ID)).isNotEqualTo(StreamTopic.report(INJECT_ID));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "dashboard",
        "dashboard:",
        "dashboard:not-a-uuid",
        "dashboards:" + INJECT_ID,
        "report:not-a-uuid",
        "reports:" + INJECT_ID,
        "reporting:" + INJECT_ID,
        "list:dashboard",
        "list:report",
        "list:analytics:" + INJECT_ID,
        "analytics:" + INJECT_ID,
        "widget:" + INJECT_ID
      })
  @DisplayName("a dashboard, report or analytics topic of the wrong shape is not known")
  void given_badDashboardReportOrAnalyticsTopic_should_notBeKnown(String raw) {
    assertThatCode(() -> StreamTopic.parse(raw)).doesNotThrowAnyException();
    assertThat(StreamTopic.parse(raw)).isEmpty();
    assertThat(StreamTopic.parse("dashboard:" + INJECT_ID.toUpperCase())).isEmpty();
  }
}
