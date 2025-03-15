package io.openbas.rest.stream;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.audit.BaseEvent;
import jakarta.annotation.Resource;
import lombok.extern.java.Log;
import org.springframework.context.event.EventListener;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.audit.ModelBaseListener.DATA_DELETE;
import static java.time.Instant.now;

@Log
@Service
public class StreamService {

  @Resource
  protected ObjectMapper mapper;

  public static final String EVENT_TYPE_MESSAGE = "message";
  public static final String EVENT_TYPE_PING = "ping";
  private final Map<String, Tuple2<OpenBASPrincipal, FluxSink<Object>>> consumers = new HashMap<>();

  @EventListener
  public void listenDatabaseUpdate(BaseEvent event) {
    consumers.entrySet().stream()
        .parallel()
        .forEach(
            entry -> {
              Tuple2<OpenBASPrincipal, FluxSink<Object>> tupleFlux = entry.getValue();
              OpenBASPrincipal principal = tupleFlux.getT1();
              FluxSink<Object> fluxSink = tupleFlux.getT2();
              BaseEvent streamEvent = buildStreamEvent(event, principal.isAdmin());
              sendStreamEvent(fluxSink, streamEvent);
            });
  }

  public Flux<Object> buildDatabaseEventFlux() {
    String sessionId = RequestContextHolder.currentRequestAttributes().getSessionId();
    return Flux.create(
            fluxSinkConsumer ->
                consumers.put(sessionId, Tuples.of(currentUser(), fluxSinkConsumer)))
        .doAfterTerminate(() -> consumers.remove(sessionId));
  }

  public Flux<Object> buildHealthCheckEventFlux() {
    return Flux.interval(Duration.ofSeconds(1))
        .map(
            l -> ServerSentEvent.builder(now().getEpochSecond()).event(EVENT_TYPE_PING).build());
  }

  public BaseEvent buildStreamEvent(BaseEvent event, Boolean userIsAdmin) {
    boolean isCurrentObserver = event.isUserObserver(userIsAdmin);
    if (!isCurrentObserver) {
      // If user as no visibility, we can send a "delete" userEvent with only the internal
      // id
      try {
        String propertyId =
            event
                .getInstance()
                .getClass()
                .getDeclaredField("id")
                .getAnnotation(JsonProperty.class)
                .value();
        ObjectNode deleteNode = mapper.createObjectNode();
        deleteNode.set(
            propertyId, mapper.convertValue(event.getInstance().getId(), JsonNode.class));
        BaseEvent userEvent = event.clone();
        userEvent.setInstanceData(deleteNode);
        userEvent.setType(DATA_DELETE);
        return userEvent;
      } catch (Exception e) {
        String simpleName = event.getInstance().getClass().getSimpleName();
        log.log(Level.WARNING, "Class " + simpleName + " cant be streamed", e);
      }
    } else {
      return event;
    }
    return event;
  }

  // -- PRIVATE --

  private void sendStreamEvent(FluxSink<Object> flux, BaseEvent event) {
    // Serialize the instance now for lazy session decoupling
    event.setInstanceData(mapper.valueToTree(event.getInstance()));
    ServerSentEvent<BaseEvent> message =
        ServerSentEvent.builder(event).event(EVENT_TYPE_MESSAGE).build();
    flux.next(message);
  }

}
