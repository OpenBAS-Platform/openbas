package io.openaev.stream;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("StreamMessages: the wire format")
class StreamMessagesTest {

  @Nested
  @DisplayName("Server messages")
  class ServerMessages {

    @Test
    @DisplayName("each message has its exact shape")
    void given_serverMessages_should_haveExactShape() {
      assertThatJson(StreamMessages.ready()).isEqualTo("{\"type\":\"ready\",\"protocol\":1}");
      assertThatJson(StreamMessages.heartbeat()).isEqualTo("{\"type\":\"heartbeat\"}");
      assertThatJson(StreamMessages.invalidate(StreamTopic.LIST_SCENARIOS))
          .isEqualTo("{\"type\":\"invalidate\",\"topic\":\"list:scenarios\"}");
      assertThatJson(
              StreamMessages.subscribed(List.of("list:scenarios"), List.of("list:simulations")))
          .isEqualTo(
              "{\"type\":\"subscribed\",\"granted\":[\"list:scenarios\"],"
                  + "\"denied\":[\"list:simulations\"]}");
      assertThatJson(StreamMessages.subscribed(List.of(), List.of()))
          .isEqualTo("{\"type\":\"subscribed\",\"granted\":[],\"denied\":[]}");
      assertThatJson(StreamMessages.subscriptionRevoked(Set.of(StreamTopic.LIST_SCENARIOS)))
          .isEqualTo("{\"type\":\"subscription-revoked\",\"topics\":[\"list:scenarios\"]}");
    }
  }

  @Nested
  @DisplayName("Parsing subscribe")
  class ParsingSubscribe {

    @Test
    @DisplayName("a well-formed subscribe yields its distinct topics")
    void given_wellFormedSubscribe_should_returnTopics() {
      assertThat(
              StreamMessages.parseSubscribe(
                  "{\"type\":\"subscribe\",\"topics\":"
                      + "[\"list:scenarios\",\"list:simulations\",\"list:scenarios\"]}"))
          .contains(Set.of("list:scenarios", "list:simulations"));
      assertThat(StreamMessages.parseSubscribe("{\"type\":\"subscribe\",\"topics\":[]}"))
          .contains(Set.of());
    }

    @ParameterizedTest
    @ValueSource(
        strings = {
          "",
          "not json",
          "null",
          "[]",
          "\"subscribe\"",
          "{}",
          "{\"type\":\"subscribe\"}",
          "{\"topics\":[\"list:scenarios\"]}",
          "{\"type\":\"unsubscribe\",\"topics\":[]}",
          "{\"type\":1,\"topics\":[]}",
          "{\"type\":\"subscribe\",\"topics\":\"list:scenarios\"}",
          "{\"type\":\"subscribe\",\"topics\":[1]}",
          "{\"type\":\"subscribe\",\"topics\":[null]}",
          "{\"type\":\"subscribe\",\"topics\":[\"LIST\"]}",
          "{\"type\":\"subscribe\",\"topics\":[],\"extra\":true}",
          "{\"type\":\"subscribe\",\"topics\":[[\"list:scenarios\"]]}"
        })
    @DisplayName("anything else is malformed")
    void given_malformedPayload_should_returnEmpty(String payload) {
      assertThat(StreamMessages.parseSubscribe(payload)).isEmpty();
    }

    @Test
    @DisplayName("more than the topic limit is malformed")
    void given_tooManyTopics_should_returnEmpty() {
      String topics =
          IntStream.rangeClosed(0, StreamMessages.MAX_TOPICS)
              .mapToObj(i -> "\"list:t" + i + "\"")
              .collect(Collectors.joining(","));

      assertThat(
              StreamMessages.parseSubscribe("{\"type\":\"subscribe\",\"topics\":[" + topics + "]}"))
          .isEmpty();
    }

    @Test
    @DisplayName("exactly the topic limit is accepted")
    void given_topicLimit_should_beAccepted() {
      String topics =
          IntStream.range(0, StreamMessages.MAX_TOPICS)
              .mapToObj(i -> "\"list:t" + i + "\"")
              .collect(Collectors.joining(","));

      assertThat(
              StreamMessages.parseSubscribe("{\"type\":\"subscribe\",\"topics\":[" + topics + "]}"))
          .hasValueSatisfying(set -> assertThat(set).hasSize(StreamMessages.MAX_TOPICS));
    }
  }
}
