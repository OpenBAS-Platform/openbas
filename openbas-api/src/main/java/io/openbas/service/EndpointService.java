package io.openbas.service;

import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
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

  public List<Endpoint> findEndpointByHostname(
      @NotBlank final String hostname,
      @NotNull final Endpoint.PLATFORM_TYPE platform,
      @NotNull final Endpoint.PLATFORM_ARCH arch) {
    return this.endpointRepository.findByHostnameArchAndPlatform(
        hostname.toLowerCase(), platform.name(), arch.name());
  }

  public List<Endpoint> findEndpointByHostnameAndAtLeastOneIp(
      @NotBlank final String hostname,
      @NotNull final Endpoint.PLATFORM_TYPE platform,
      @NotNull final Endpoint.PLATFORM_ARCH arch,
      @NotNull final String[] ips) {
    return this.endpointRepository.findByHostnameAndAtleastOneIp(
        hostname, platform.name(), arch.name(), ips);
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
  public void registerAgentEndpoint(EndpointRegisterInput input) {
    // Check if agent exists (only 1 agent can be found for Crowdstrike and Tanium)
    List<Agent> existingAgents = agentService.findByExternalReference(input.getExternalReference());
    if (!existingAgents.isEmpty()) {
      Agent existingAgent = existingAgents.getFirst();
      if (input.isActive()) {
        updateExistingAgent(existingAgent, input);
      } else {
        // Delete inactive agent
        handleInactiveAgent(existingAgent);
      }
    } else {
      // Check if endpoint exists
      Optional<Endpoint> existingEndpoint =
          findEndpointByAtLeastOneMacAddress(input.getMacAddresses());
      if (existingEndpoint.isPresent()) {
        updateExistingEndpointAndManageAgent(existingEndpoint.get(), input);
      } else {
        createNewEndpointAndAgent(input);
      }
    }
  }

  public Endpoint register(final EndpointRegisterInput input) throws IOException {
    input.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
    input.setLastSeen(Instant.now());
    Agent agent;
    // Check if agents exist (because we can find X openbas agent on an endpoint)
    List<Agent> existingAgents = agentService.findByExternalReference(input.getExternalReference());
    if (!existingAgents.isEmpty()) {
      // Check if this specific agent exist
      Agent.DEPLOYMENT_MODE deploymentMode =
          input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session;
      Agent.PRIVILEGE privilege =
          input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard;
      Optional<Agent> existingAgent =
          existingAgents.stream()
              .filter(
                  ag ->
                      ag.getExecutedByUser().equals(input.getExecutedByUser())
                          && ag.getDeploymentMode().equals(deploymentMode)
                          && ag.getPrivilege().equals(privilege))
              .findFirst();
      if (existingAgent.isPresent()) {
        agent = updateExistingAgent(existingAgent.get(), input);
      } else {
        agent =
            updateExistingEndpointAndCreateAgent(
                (Endpoint) Hibernate.unproxy(existingAgents.getFirst().getAsset()), input);
      }
    } else {
      // Check if endpoint exists
      Optional<Endpoint> existingEndpoint =
          findEndpointByAtLeastOneMacAddress(input.getMacAddresses());
      if (existingEndpoint.isPresent()) {
        agent = updateExistingEndpointAndManageAgent(existingEndpoint.get(), input);
      } else {
        agent = createNewEndpointAndAgent(input);
      }
    }
    // If agent is not temporary and not the same version as the platform => Create an upgrade task
    // for the agent
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    if (agent.getParent() == null && !agent.getVersion().equals(version)) {
      AssetAgentJob assetAgentJob = new AssetAgentJob();
      assetAgentJob.setCommand(generateUpgradeCommand(endpoint.getPlatform().name()));
      assetAgentJob.setAgent(agent);
      assetAgentJobRepository.save(assetAgentJob);
    }
    return endpoint;
  }

  private Agent updateExistingEndpointAndManageAgent(
      Endpoint endpoint, EndpointRegisterInput input) {
    setUpdatedEndpointAttributes(endpoint, input);
    updateEndpoint(endpoint);
    return createOrUpdateAgent(endpoint, input);
  }

  private Agent updateExistingEndpointAndCreateAgent(
      Endpoint endpoint, EndpointRegisterInput input) {
    setUpdatedEndpointAttributes(endpoint, input);
    updateEndpoint(endpoint);
    Agent agent = new Agent();
    setNewAgentAttributes(input, agent);
    setUpdatedAgentAttributes(agent, input, endpoint);
    return agentService.createOrUpdateAgent(agent);
  }

  private Agent createOrUpdateAgent(Endpoint endpoint, EndpointRegisterInput input) {
    Agent.DEPLOYMENT_MODE deploymentMode =
        input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session;
    Agent.PRIVILEGE privilege =
        input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard;
    Optional<Agent> existingAgent =
        agentService.getAgentForAnAsset(
            endpoint.getId(),
            input.getExecutedByUser(),
            deploymentMode,
            privilege,
            input.getExecutor().getType());
    Agent agent;
    if (existingAgent.isPresent()) {
      agent = existingAgent.get();
    } else {
      agent = new Agent();
      setNewAgentAttributes(input, agent);
    }
    setUpdatedAgentAttributes(agent, input, endpoint);
    return agentService.createOrUpdateAgent(agent);
  }

  private void setUpdatedEndpointAttributes(Endpoint endpoint, EndpointRegisterInput input) {
    // Hostname not updated by Crowdstrike because Crowdstrike hostname is 15 length max
    if (!CROWDSTRIKE_EXECUTOR_TYPE.equals(input.getExecutor().getType())) {
      endpoint.setHostname(input.getHostname());
    }
    endpoint.addAllIpAddresses(input.getIps());
    endpoint.addAllMacAddresses(input.getMacAddresses());
  }

  private Agent updateExistingAgent(Agent agent, EndpointRegisterInput input) {
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    setUpdatedEndpointAttributes(endpoint, input);
    updateEndpoint(endpoint);
    setUpdatedAgentAttributes(agent, input, endpoint);
    return agentService.createOrUpdateAgent(agent);
  }

  private void setUpdatedAgentAttributes(
      Agent agent, EndpointRegisterInput input, Endpoint endpoint) {
    agent.setAsset(endpoint);
    agent.setLastSeen(input.getLastSeen());
    agent.setExternalReference(input.getExternalReference());
    // For OpenBAS agent
    agent.setVersion(input.getAgentVersion());
  }

  private Agent createNewEndpointAndAgent(EndpointRegisterInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.addAllIpAddresses(input.getIps());
    endpoint.addAllMacAddresses(input.getMacAddresses());
    createEndpoint(endpoint);
    Agent agent = new Agent();
    setUpdatedAgentAttributes(agent, input, endpoint);
    setNewAgentAttributes(input, agent);
    return agentService.createOrUpdateAgent(agent);
  }

  private void setNewAgentAttributes(EndpointRegisterInput input, Agent agent) {
    agent.setPrivilege(input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard);
    agent.setDeploymentMode(
        input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session);
    agent.setExecutedByUser(input.getExecutedByUser());
    agent.setExecutor(input.getExecutor());
  }

  private void handleInactiveAgent(Agent existingAgent) {
    if ((now().toEpochMilli() - existingAgent.getLastSeen().toEpochMilli()) > DELETE_TTL) {
      log.info(
          "Found stale endpoint "
              + existingAgent.getAsset().getName()
              + ", deleting the "
              + existingAgent.getExecutor().getType()
              + " agent "
              + existingAgent.getExecutedByUser()
              + " in it...");
      this.agentService.deleteAgent(existingAgent.getId());
    }
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
