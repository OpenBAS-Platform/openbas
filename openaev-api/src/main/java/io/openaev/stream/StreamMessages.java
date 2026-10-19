package io.openaev.stream;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Wire format of the stream: small JSON objects keyed by {@code type}. Messages name topics only,
 * never an id, a name or an author.
 *
 * <p>The server is strict on what it reads: the only accepted message is a {@code subscribe} with
 * exactly a {@code type} and a {@code topics} array of at most {@link #MAX_TOPICS} well-formed
 * topic strings. Anything else is malformed and closes the socket.
 */
final class StreamMessages {

  static final int PROTOCOL_VERSION = 1;
  static final int MAX_TOPICS = 64;

  static final String TYPE = "type";
  static final String TYPE_READY = "ready";
  static final String TYPE_SUBSCRIBE = "subscribe";
  static final String TYPE_SUBSCRIBED = "subscribed";
  static final String TYPE_INVALIDATE = "invalidate";
  static final String TYPE_SUBSCRIPTION_REVOKED = "subscription-revoked";
  static final String TYPE_HEARTBEAT = "heartbeat";

  static final String FIELD_PROTOCOL = "protocol";
  static final String FIELD_TOPIC = "topic";
  static final String FIELD_TOPICS = "topics";
  static final String FIELD_GRANTED = "granted";
  static final String FIELD_DENIED = "denied";

  private static final ObjectMapper MAPPER = new ObjectMapper();

  private StreamMessages() {}

  static String ready() {
    return write(message(TYPE_READY).put(FIELD_PROTOCOL, PROTOCOL_VERSION));
  }

  static String heartbeat() {
    return write(message(TYPE_HEARTBEAT));
  }

  static String invalidate(StreamTopic topic) {
    return write(message(TYPE_INVALIDATE).put(FIELD_TOPIC, topic.getValue()));
  }

  static String subscribed(Collection<String> granted, Collection<String> denied) {
    ObjectNode node = message(TYPE_SUBSCRIBED);
    granted.forEach(node.putArray(FIELD_GRANTED)::add);
    denied.forEach(node.putArray(FIELD_DENIED)::add);
    return write(node);
  }

  static String subscriptionRevoked(Collection<StreamTopic> topics) {
    ObjectNode node = message(TYPE_SUBSCRIPTION_REVOKED);
    ArrayNode array = node.putArray(FIELD_TOPICS);
    topics.forEach(topic -> array.add(topic.getValue()));
    return write(node);
  }

  /**
   * The distinct topic strings of a well-formed {@code subscribe}, in order, or empty when the
   * payload is anything else. Never throws.
   */
  static Optional<Set<String>> parseSubscribe(String payload) {
    JsonNode root;
    try {
      root = MAPPER.readTree(payload);
    } catch (JsonProcessingException | RuntimeException e) {
      return Optional.empty();
    }
    if (root == null || !root.isObject() || root.size() != 2) {
      return Optional.empty();
    }
    JsonNode type = root.get(TYPE);
    JsonNode topics = root.get(FIELD_TOPICS);
    if (type == null
        || !type.isTextual()
        || !TYPE_SUBSCRIBE.equals(type.asText())
        || topics == null
        || !topics.isArray()
        || topics.size() > MAX_TOPICS) {
      return Optional.empty();
    }
    Set<String> result = new LinkedHashSet<>();
    for (Iterator<JsonNode> it = topics.elements(); it.hasNext(); ) {
      JsonNode topic = it.next();
      if (!topic.isTextual() || !StreamTopic.isWellFormed(topic.asText())) {
        return Optional.empty();
      }
      result.add(topic.asText());
    }
    return Optional.of(result);
  }

  private static ObjectNode message(String type) {
    return MAPPER.createObjectNode().put(TYPE, type);
  }

  private static String write(ObjectNode node) {
    try {
      return MAPPER.writeValueAsString(node);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("cannot serialize a stream message", e);
    }
  }
}
