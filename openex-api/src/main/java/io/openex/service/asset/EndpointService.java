package io.openex.service.asset;

import io.openex.database.model.Endpoint;
import io.openex.database.repository.EndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class EndpointService {

  private final EndpointRepository endpointRepository;

  public Endpoint createEndpoint(@NotNull final Endpoint endpoint) {
    return this.endpointRepository.save(endpoint);
  }

  public Endpoint endpoint(@NotBlank final String endpointId) {
    return this.endpointRepository.findById(endpointId).orElseThrow();
  }

  public List<Endpoint> endpoints() {
    return fromIterable(this.endpointRepository.findAll());
  }

  public Endpoint updateEndpoint(@NotNull final Endpoint endpoint) {
    endpoint.setUpdatedAt(now());
    return this.endpointRepository.save(endpoint);
  }

  public void deleteEndpoint(@NotBlank final String endpointId) {
    this.endpointRepository.deleteById(endpointId);
  }

}
