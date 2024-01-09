package io.openex.service;

import io.openex.database.model.Endpoint;
import io.openex.database.repository.EndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class AssetEndpointService {

  private final EndpointRepository endpointRepository;

  public Endpoint createEndpoint(@NotNull final Endpoint endpoint) {
    return this.endpointRepository.save(endpoint);
  }

  public Iterable<Endpoint> createEndpoints(@NotNull final List<Endpoint> endpoints) {
    return this.endpointRepository.saveAll(endpoints);
  }

  public Endpoint endpoint(@NotBlank final String endpointId) {
    return this.endpointRepository.findById(endpointId).orElseThrow();
  }

  public Optional<Endpoint> findBySource(
      @NotBlank final String sourceKey,
      @NotBlank final String sourceValue) {
    return this.endpointRepository.findBySource(sourceKey, sourceValue);
  }

  public List<Endpoint> endpoints() {
    return fromIterable(this.endpointRepository.findAll());
  }

  public Endpoint updateEndpoint(@NotNull final Endpoint endpoint) {
    endpoint.setUpdatedAt(now());
    return this.endpointRepository.save(endpoint);
  }

  public Iterable<Endpoint> updateEndpoints(@NotNull final List<Endpoint> endpoints) {
    endpoints.forEach((e) -> e.setUpdatedAt(now()));
    return this.endpointRepository.saveAll(endpoints);
  }

  public void deleteEndpoint(@NotBlank final String endpointId) {
    this.endpointRepository.deleteById(endpointId);
  }

}
