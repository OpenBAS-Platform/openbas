package io.openbas.rest.stream;

import io.openbas.rest.helper.RestBehavior;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequiredArgsConstructor
public class StreamApi extends RestBehavior {

  public static final String X_ACCEL_BUFFERING = "X-Accel-Buffering";

  private final StreamService streamService;

  /** Create a flux for current user & session */
  @GetMapping(path = "/api/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public ResponseEntity<Flux<Object>> streamFlux() {
    Flux<Object> dataFlux = this.streamService.buildDatabaseEventFlux();
    Flux<Object> ping = this.streamService.buildHealthCheckEventFlux();
    // Merge the 2 flux to create the final one.
    return ResponseEntity.ok()
        .header(HttpHeaders.CACHE_CONTROL, "no-cache")
        .header(X_ACCEL_BUFFERING, "no")
        .body(Flux.merge(dataFlux, ping));
  }
}
