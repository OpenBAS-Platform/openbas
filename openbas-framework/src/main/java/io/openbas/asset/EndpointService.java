package io.openbas.asset;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.database.repository.EndpointRepository;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static io.openbas.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class EndpointService {

  @Resource
  private OpenBASConfig openBASConfig;

  @Value("${openbas.admin.token:#{null}}")
  private String adminToken;

  @Value("${info.app.version:unknown}") String version;

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

  @Transactional(readOnly = true)
  public List<Endpoint> findByHostname(@NotBlank final String hostname) {
    return this.endpointRepository.findByHostname(hostname);
  }

  @Transactional(readOnly = true)
  public List<Endpoint> findAssetsForInjectionByHostname(@NotBlank final String hostname) {
    return this.endpointRepository.findForInjectionByHostname(hostname);
  }

  @Transactional(readOnly = true)
  public List<Endpoint> findAssetsForExecutionByHostname(@NotBlank final String hostname) {
    return this.endpointRepository.findForExecutionByHostname(hostname);
  }

  @Transactional(readOnly = true)
  public Optional<Endpoint> findByExternalReference(@NotBlank final String externalReference) {
    return this.endpointRepository.findByExternalReference(externalReference);
  }

  public List<Endpoint> endpoints() {
    return fromIterable(this.endpointRepository.findAll());
  }

  public List<Endpoint> endpoints(@NotNull final Specification<Endpoint> specification) {
    return fromIterable(this.endpointRepository.findAll(specification));
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

  public String generateInstallCommand(String platform) throws IOException {
    if (platform.equalsIgnoreCase("windows")) {
      return "Stop-Service -Force -Name \"OBAS Agent Service\"; Invoke-WebRequest -Uri " +
              "\"" + openBASConfig.getBaseUrl() + "/api/agent/package/openbas/windows\" -OutFile \"openbas-installer.exe\"; " +
              "./openbas-installer.exe /S ~OPENBAS_URL=\"" + openBASConfig.getBaseUrl() + "\" ~ACCESS_TOKEN=\""+ adminToken + "\"; " +
              "Start-Sleep -Seconds 1.5; rm -force ./openbas-installer.exe;";
    }
    if (platform.equalsIgnoreCase("linux")) {
      String filename = "openbas-agent-installer-" + version + ".sh";
      InputStream in = getClass().getResourceAsStream("/agents/openbas/linux/" + filename);
      if (in != null) {
        return IOUtils.toString(in, StandardCharsets.UTF_8)
                .replace("${OPENBAS_URL}", openBASConfig.getBaseUrl())
                .replace("${OPENBAS_TOKEN}", adminToken);
      }
    }
    throw new UnsupportedOperationException("Agent " + platform + " installer not supported");
  }
}
