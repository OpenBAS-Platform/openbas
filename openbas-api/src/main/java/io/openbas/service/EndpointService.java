package io.openbas.service;

import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_TYPE;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.ArchitectureFilterUtils.handleEndpointFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Agent;
import io.openbas.database.model.AssetAgentJob;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.AssetAgentJobRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.rest.asset.endpoint.form.EndpointUpdateInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.io.IOUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class EndpointService {

  public static final int DELETE_TTL = 86400000; // 24 hours

  public static String JFROG_BASE = "https://filigran.jfrog.io/artifactory";

  @Resource private OpenBASConfig openBASConfig;

  @Value("${openbas.admin.token:#{null}}")
  private String adminToken;

  @Value("${info.app.version:unknown}")
  String version;

  @Value("${executor.openbas.binaries.origin:local}")
  private String executorOpenbasBinariesOrigin;

  @Value("${executor.openbas.binaries.version:${info.app.version:unknown}}")
  private String executorOpenbasBinariesVersion;

  private final EndpointRepository endpointRepository;
  private final ExecutorRepository executorRepository;
  private final AssetAgentJobRepository assetAgentJobRepository;
  private final TagRepository tagRepository;
  private final AgentService agentService;

  // -- CRUD --
  public Endpoint createEndpoint(@NotNull final Endpoint endpoint) {
    return this.endpointRepository.save(endpoint);
  }

  public Endpoint endpoint(@NotBlank final String endpointId) {
    return this.endpointRepository
        .findById(endpointId)
        .orElseThrow(() -> new ElementNotFoundException("Endpoint not found"));
  }

  public Optional<Endpoint> findEndpointByHostnameAndAtLeastOneIp(
      @NotBlank final String hostname, @NotNull final String[] ips) {
    return this.endpointRepository.findByHostnameAndAtleastOneIp(hostname, ips);
  }

  public Optional<Endpoint> findEndpointByAtLeastOneMacAddress(
      @NotNull final String[] macAddresses) {
    return this.endpointRepository.findByAtleastOneMacAddress(macAddresses);
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

  public void deleteEndpoint(@NotBlank final String endpointId) {
    this.endpointRepository.deleteById(endpointId);
  }

  public Endpoint getEndpoint(@NotBlank final String endpointId) {
    return endpoint(endpointId);
  }

  public Page<Endpoint> searchEndpoints(SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<Endpoint> specification, Pageable pageable) ->
            this.endpointRepository.findAll(
                EndpointSpecification.findEndpointsForInjection().and(specification), pageable),
        handleEndpointFilter(searchPaginationInput),
        Endpoint.class);
  }

  public Endpoint updateEndpoint(
      @NotBlank final String endpointId, @NotNull final EndpointUpdateInput input) {
    Endpoint toUpdate = this.endpoint(endpointId);
    toUpdate.setUpdateAttributes(input);
    toUpdate.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return updateEndpoint(toUpdate);
  }

  // -- INSTALLATION AGENT --
  public void registerAgentEndpoint(Agent agent, String executorType) {
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    // Check if agent exists (only 1 agent can be found for Crowdstrike and Tanium)
    List<Agent> optionalAgents = agentService.findByExternalReference(agent.getExternalReference());
    if (!optionalAgents.isEmpty()) {
      Agent existingAgent = optionalAgents.getFirst();
      if (agent.isActive()) {
        endpoint.setId(existingAgent.getAsset().getId());
        manageOptAgentAndRegisterAgentEndpoint(
            Optional.of(existingAgent), agent, endpoint, executorType);
      } else {
        // Delete inactive agent
        handleInactiveAgent(existingAgent, executorType);
      }
    } else {
      // Check if endpoint exists
      manageOptEndpointAndRegisterAgentEndpoint(agent, executorType, endpoint);
    }
  }

  private void manageOptEndpointAndRegisterAgentEndpoint(
      Agent agent, String executorType, Endpoint endpoint) {
    Optional<Endpoint> optionalEndpoint =
        findEndpointByAtLeastOneMacAddress(endpoint.getMacAddresses());
    if (optionalEndpoint.isPresent()) {
      String endpointId = optionalEndpoint.get().getId();
      Optional<Agent> optionalAgent =
          agentService.getAgentForAnAsset(
              endpointId,
              agent.getExecutedByUser(),
              agent.getDeploymentMode(),
              agent.getPrivilege(),
              executorType);
      endpoint.setId(endpointId);
      manageOptAgentAndRegisterAgentEndpoint(optionalAgent, agent, endpoint, executorType);
    } else {
      // Nothing exists, create endpoint and agent
      createNewEndpointAndAgent(agent, endpoint);
    }
  }

  private void handleInactiveAgent(Agent existingAgent, String executorType) {
    if ((now().toEpochMilli() - existingAgent.getLastSeen().toEpochMilli()) > DELETE_TTL) {
      log.info(
          "Found stale endpoint "
              + existingAgent.getAsset().getName()
              + ", deleting the "
              + executorType
              + " agent "
              + existingAgent.getExecutedByUser()
              + " in it...");
      this.agentService.deleteAgent(existingAgent.getId());
    }
  }

  public void createNewEndpointAndAgent(Agent agent, Endpoint endpoint) {
    Endpoint createdEndpoint = this.createEndpoint(endpoint);
    agent.setAsset(createdEndpoint);
    this.agentService.createOrUpdateAgent(agent);
  }

  private void manageOptAgentAndRegisterAgentEndpoint(
      Optional<Agent> optionalAgent, Agent agent, Endpoint endpoint, String executorType) {
    Agent agentToUpdate;
    if (optionalAgent.isPresent()) {
      // Update this specific agent
      agentToUpdate = optionalAgent.get();
      // For OpenBAS agent
      agentToUpdate.setVersion(agent.getVersion());
      agentToUpdate.setLastSeen(agent.getLastSeen());
      agentToUpdate.setExternalReference(agent.getExternalReference());
    } else {
      // Create this specific agent
      agentToUpdate = agent;
    }
    // Update the endpoint and the agent on it
    Endpoint endpointToUpdate = (Endpoint) Hibernate.unproxy(agentToUpdate.getAsset());
    endpointToUpdate.setId(endpoint.getId());
    // Hostname not updated by Crowdstrike because Crowdstrike hostname is 15 length max
    if (!CROWDSTRIKE_EXECUTOR_TYPE.equals(executorType)) {
      endpointToUpdate.setHostname(endpoint.getHostname());
    }
    endpointToUpdate.addAllIpAddresses(endpoint.getIps());
    endpointToUpdate.addAllMacAddresses(endpoint.getMacAddresses());
    Endpoint updatedEndpoint = this.updateEndpoint(endpointToUpdate);
    agentToUpdate.setAsset(updatedEndpoint);
    this.agentService.createOrUpdateAgent(agentToUpdate);
  }

  public Endpoint register(final EndpointRegisterInput input) throws IOException {
    final Agent agent = toAgentEndpoint(input);
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    // Check if agents exist (because we can find X openbas agent on an endpoint)
    List<Agent> optionalAgents = agentService.findByExternalReference(agent.getExternalReference());
    if (!optionalAgents.isEmpty()) {
      // Check if this specific agent exist
      Optional<Agent> optionalAgent =
          optionalAgents.stream()
              .filter(
                  ag ->
                      ag.getExecutedByUser().equals(agent.getExecutedByUser())
                          && ag.getDeploymentMode().equals(agent.getDeploymentMode())
                          && ag.getPrivilege().equals(agent.getPrivilege()))
              .findFirst();
      endpoint.setId(optionalAgents.getFirst().getAsset().getId());
      manageOptAgentAndRegisterAgentEndpoint(optionalAgent, agent, endpoint, OPENBAS_EXECUTOR_TYPE);
    } else {
      // Check if endpoint exists
      manageOptEndpointAndRegisterAgentEndpoint(agent, OPENBAS_EXECUTOR_TYPE, endpoint);
    }
    // If agent is not temporary and not the same version as the platform => Create an upgrade task
    // for the agent
    if (agent.getParent() == null && !agent.getVersion().equals(version)) {
      AssetAgentJob assetAgentJob = new AssetAgentJob();
      assetAgentJob.setCommand(generateUpgradeCommand(endpoint.getPlatform().name()));
      assetAgentJob.setAgent(agent);
      assetAgentJobRepository.save(assetAgentJob);
    }
    return endpoint;
  }

  private Agent toAgentEndpoint(final EndpointRegisterInput input) {
    Agent agent = new Agent();
    Endpoint endpoint = new Endpoint();
    agent.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
    agent.setExternalReference(input.getExternalReference());
    agent.setPrivilege(input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard);
    agent.setDeploymentMode(
        input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session);
    agent.setExecutedByUser(input.getExecutedByUser());
    agent.setVersion(input.getAgentVersion());
    agent.setLastSeen(Instant.now());
    endpoint.setUpdateAttributes(input);
    agent.setAsset(endpoint);
    return agent;
  }

  public String getFileOrDownloadFromJfrog(String platform, String file, String adminToken)
      throws IOException {
    String extension =
        switch (platform.toLowerCase()) {
          case "windows" -> "ps1";
          case "linux", "macos" -> "sh";
          default -> throw new UnsupportedOperationException("");
        };
    InputStream in = null;
    String filename;
    String resourcePath = "/openbas-agent/" + platform.toLowerCase() + "/";

    if (executorOpenbasBinariesOrigin.equals("local")) { // if we want the local binaries
      filename = file + "-" + version + "." + extension;
      in = getClass().getResourceAsStream("/agents" + resourcePath + filename);
    } else if (executorOpenbasBinariesOrigin.equals(
        "repository")) { // if we want a specific version from artifactory
      filename = file + "-" + executorOpenbasBinariesVersion + "." + extension;
      in = new BufferedInputStream(new URL(JFROG_BASE + resourcePath + filename).openStream());
    }
    if (in == null) {
      throw new UnsupportedOperationException(
          "Agent installer version " + executorOpenbasBinariesVersion + " not found");
    }

    return IOUtils.toString(in, StandardCharsets.UTF_8)
        .replace("${OPENBAS_URL}", openBASConfig.getBaseUrlForAgent())
        .replace("${OPENBAS_TOKEN}", adminToken)
        .replace(
            "${OPENBAS_UNSECURED_CERTIFICATE}",
            String.valueOf(openBASConfig.isUnsecuredCertificate()))
        .replace("${OPENBAS_WITH_PROXY}", String.valueOf(openBASConfig.isWithProxy()));
  }

  public String generateInstallCommand(String platform, String token) throws IOException {
    return getFileOrDownloadFromJfrog(platform, "openbas-agent-installer", token);
  }

  public String generateUpgradeCommand(String platform) throws IOException {
    return getFileOrDownloadFromJfrog(platform, "openbas-agent-upgrade", adminToken);
  }
}
