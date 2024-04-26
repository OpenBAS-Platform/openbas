package io.openbas.rest.stream;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.audit.BaseEvent;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.stream.ai.AiConfig;
import io.openbas.rest.stream.ai.AiInput;
import io.openbas.rest.stream.ai.AiResult;
import io.openbas.rest.stream.ai.AiSubscriber;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.FluxSink;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;
import java.util.logging.Logger;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.audit.ModelBaseListener.DATA_DELETE;
import static io.openbas.rest.stream.ai.AiPrompt.promptGeneration;
import static java.time.Instant.now;

@RestController
public class StreamApi extends RestBehavior {

    public static final String EVENT_TYPE_MESSAGE = "message";
    public static final String EVENT_TYPE_PING = "ping";
    public static final String X_ACCEL_BUFFERING = "X-Accel-Buffering";
    private static final Logger LOGGER = Logger.getLogger(StreamApi.class.getName());
    private final Map<String, Tuple2<OpenBASPrincipal, FluxSink<Object>>> consumers = new HashMap<>();
    private AiConfig aiConfig;

    @Autowired
    public void setAiConfig(AiConfig aiConfig) {
        this.aiConfig = aiConfig;
    }

    private void sendStreamEvent(FluxSink<Object> flux, BaseEvent event) {
        // Serialize the instance now for lazy session decoupling
        event.setInstanceData(mapper.valueToTree(event.getInstance()));
        ServerSentEvent<BaseEvent> message = ServerSentEvent.builder(event)
                .event(EVENT_TYPE_MESSAGE).build();
        flux.next(message);
    }

    @EventListener
    public void listenDatabaseUpdate(BaseEvent event) {
        consumers.entrySet().stream()
                .parallel().forEach(entry -> {
                    Tuple2<OpenBASPrincipal, FluxSink<Object>> tupleFlux = entry.getValue();
                    OpenBASPrincipal listener = tupleFlux.getT1();
                    FluxSink<Object> fluxSink = tupleFlux.getT2();
                    boolean isCurrentObserver = event.isUserObserver(listener.isAdmin());
                    if (!isCurrentObserver) {
                        // If user as no visibility, we can send a "delete" userEvent with only the internal id
                        try {
                            String propertyId = event.getInstance().getClass().getDeclaredField("id")
                                    .getAnnotation(JsonProperty.class).value();
                            ObjectNode deleteNode = mapper.createObjectNode();
                            deleteNode.set(propertyId, mapper.convertValue(event.getInstance().getId(), JsonNode.class));
                            BaseEvent userEvent = event.clone();
                            userEvent.setInstanceData(deleteNode);
                            userEvent.setType(DATA_DELETE);
                            sendStreamEvent(fluxSink, userEvent);
                        } catch (Exception e) {
                            String simpleName = event.getInstance().getClass().getSimpleName();
                            LOGGER.log(Level.WARNING, "Class " + simpleName + " cant be streamed", e);
                        }
                    } else {
                        sendStreamEvent(fluxSink, event);
                    }
                });
    }

    /**
     * Create a flux for current user & session
     */
    @GetMapping(path = "/api/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<Flux<Object>> streamFlux() {
        String sessionId = RequestContextHolder.currentRequestAttributes().getSessionId();
        // Build the database event flux.
        Flux<Object> dataFlux = Flux.create(fluxSinkConsumer -> consumers.put(sessionId, Tuples.of(currentUser(), fluxSinkConsumer)))
                .doAfterTerminate(() -> consumers.remove(sessionId));
        // Build the health check flux.
        Flux<Object> ping = Flux.interval(Duration.ofSeconds(1))
                .map(l -> ServerSentEvent.builder(now().getEpochSecond()).event(EVENT_TYPE_PING).build());
        // Merge the 2 flux to create the final one.
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header(X_ACCEL_BUFFERING, "no")
                .body(Flux.merge(dataFlux, ping));
    }

    /**
     * Create a flux for ai request
     */
    @PostMapping(path = "/api/ai", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<Flux<AiResult>> aiFlux(@Valid @RequestBody final AiInput input) {
        if (!aiConfig.isEnabled()) {
            throw new UnsupportedOperationException("Ai mode is disabled");
        }
        String type = input.getType();
        @SuppressWarnings("resource") HttpClient client = HttpClient.newHttpClient();
        String body = promptGeneration(type, input.getQuestion(), aiConfig);
        String uri = switch (aiConfig.getType()) {
            case "mistralai", "openai" -> aiConfig.getEndpoint() + "/v1/chat/completions";
            default -> throw new UnsupportedOperationException("Invalid ai type");
        };
        var request = HttpRequest.newBuilder(URI.create(uri))
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .header("Authorization", "Bearer " + aiConfig.getToken())
                .header("Accept", "text/event-stream")
                .build();
        Flux<AiResult> dataFlux = Flux.create(objectFluxSink -> {
            try {
                CompletableFuture<HttpResponse<Void>> completableFuture = client.sendAsync(request, responseInfo -> {
                    if (responseInfo.statusCode() == 200) {
                        return new AiSubscriber(s -> {
                            try {
                                ObjectNode resultNode = mapper.readValue(s, ObjectNode.class);
                                String id = resultNode.get("id").textValue();
                                String content = resultNode.get("choices").get(0).get("delta").get("content").textValue();
                                objectFluxSink.next(new AiResult(id, content));
                            } catch (Exception e) {
                                // Nothing to do
                            }
                        });
                    } else {
                        throw new RuntimeException("Request failed");
                    }
                });
                completableFuture.thenApply(voidHttpResponse -> {
                    objectFluxSink.complete();
                    return "done";
                });
            } catch (Exception e) {
                objectFluxSink.complete();
            }
        });
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header(X_ACCEL_BUFFERING, "no")
                .body(dataFlux);
    }
}
