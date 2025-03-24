package io.openbas.service;

import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.ArchitectureFilterUtils.handleEndpointFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.database.repository.AssetAgentJobRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.executors.model.AgentRegisterInput;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.rest.asset.endpoint.form.EndpointUpdateInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.EndpointMapper;
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
import java.util.*;
import java.util.stream.Collectors;
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
  public static final String OPENBAS_AGENT_INSTALLER = "openbas-agent-installer";
  public static final String OPENBAS_AGENT_UPGRADE = "openbas-agent-upgrade";
  public static final String SERVICE = "service";

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
    return this.endpointRepository.findByAtleastOneMacAddress(macAddresses).stream().findFirst();
  }

  public List<Endpoint> findEndpointsByMacAddresses(final String[] macAddresses) {
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

  public Iterable<Endpoint> saveAllEndpoints(List<Endpoint> endpoints) {
    return this.endpointRepository.saveAll(endpoints);
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
  public void registerAgentEndpoint(AgentRegisterInput input) {
    // Check if agent exists (only 1 agent can be found for Tanium)
    List<Agent> existingAgents = agentService.findByExternalReference(input.getExternalReference());
    if (!existingAgents.isEmpty()) {
      updateExistingAgent(existingAgents.getFirst(), input);
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

  public void syncAgentsEndpoints(
      List<AgentRegisterInput> inputs, List<Agent> existingAgents, AssetGroup assetGroup) {
    List<Agent> agentsToSave = new ArrayList<>();
    List<Endpoint> endpointsToSave = new ArrayList<>();
    AgentRegisterInput inputToSave;
    // Update agents/endpoints with external reference
    Set<String> inputsExternalRefs =
        inputs.stream().map(AgentRegisterInput::getExternalReference).collect(Collectors.toSet());
    Set<Agent> agentsToUpdate =
        existingAgents.stream()
            .filter(agent -> inputsExternalRefs.contains(agent.getExternalReference()))
            .collect(Collectors.toSet());
    for(Agent agentToUpdate : agentsToUpdate) {
      inputToSave = inputs.stream().filter(input -> input.getExternalReference().equals(agentToUpdate.getExternalReference())).findFirst().get();
      Endpoint endpoint = (Endpoint) Hibernate.unproxy(agentToUpdate.getAsset());
      setUpdatedEndpointAttributes(endpoint, inputToSave);
      agentToUpdate.setAsset(endpoint);
      agentToUpdate.setLastSeen(inputToSave.getLastSeen());
    }
    // TODO create or update asset/asset group
    inputs.removeIf(input -> inputsExternalRefs.contains(input.getExternalReference()));
    // Update agents/endpoints with mac address
    String[] inputsMacAddresses = inputs.stream().map(AgentRegisterInput::getMacAddresses).toList().stream().flatMap(Arrays::stream).toArray(String[]::new);
    List<Endpoint> endpointsToUpdate = findEndpointsByMacAddresses(inputsMacAddresses);
    for(Endpoint endpointToUpdate : endpointsToUpdate) {
      inputToSave = inputs.stream().filter(input -> Arrays.asList(input.getMacAddresses()).retainAll(Arrays.asList(endpointToUpdate.getMacAddresses()))).findFirst().get();
    }
    // TODO update endpoint + create agent if mac address

    // TODO "createNewEndpointAndAgent(input);"
    // TODO create or update asset/asset group

    saveAllEndpoints(endpointsToSave);
    agentService.saveAllAgents(agentsToSave);
    List<String> existingAssetIds = assetGroup.getAssets().stream().map(Asset::getId).toList();
    // TODO delete asset/asset group no more in asset group with comparing existingAssetIds and endpoints from agents to update/create

  }

  public Endpoint register(final EndpointRegisterInput input) throws IOException {
    AgentRegisterInput agentInput = toAgentEndpoint(input);
    Agent agent;
    // Check if agents exist (because we can find X openbas agent on an endpoint)
    List<Agent> existingAgents =
        agentService.findByExternalReference(agentInput.getExternalReference());
    if (!existingAgents.isEmpty()) {
      // Check if this specific agent exist
      Agent.DEPLOYMENT_MODE deploymentMode =
          agentInput.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session;
      Agent.PRIVILEGE privilege =
          agentInput.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard;
      Optional<Agent> existingAgent =
          existingAgents.stream()
              .filter(
                  ag ->
                      ag.getExecutedByUser().equals(agentInput.getExecutedByUser())
                          && ag.getDeploymentMode().equals(deploymentMode)
                          && ag.getPrivilege().equals(privilege))
              .findFirst();
      if (existingAgent.isPresent()) {
        agent = updateExistingAgent(existingAgent.get(), agentInput);
      } else {
        agent =
            updateExistingEndpointAndCreateAgent(
                (Endpoint) Hibernate.unproxy(existingAgents.getFirst().getAsset()), agentInput);
      }
    } else {
      // Check if endpoint exists
      Optional<Endpoint> existingEndpoint =
          findEndpointByAtLeastOneMacAddress(agentInput.getMacAddresses());
      if (existingEndpoint.isPresent()) {
        agent = updateExistingEndpointAndManageAgent(existingEndpoint.get(), agentInput);
      } else {
        agent = createNewEndpointAndAgent(agentInput);
      }
    }
    // If agent is not temporary and not the same version as the platform => Create an upgrade task
    // for the agent
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    if (agent.getParent() == null && !agent.getVersion().equals(version)) {
      AssetAgentJob assetAgentJob = new AssetAgentJob();
      assetAgentJob.setCommand(
          generateUpgradeCommand(endpoint.getPlatform().name(), input.getInstallationMode()));
      assetAgentJob.setAgent(agent);
      assetAgentJobRepository.save(assetAgentJob);
    }
    return endpoint;
  }

  private Agent updateExistingEndpointAndManageAgent(Endpoint endpoint, AgentRegisterInput input) {
    setUpdatedEndpointAttributes(endpoint, input);
    updateEndpoint(endpoint);
    return createOrUpdateAgent(endpoint, input);
  }

  private Agent updateExistingEndpointAndCreateAgent(Endpoint endpoint, AgentRegisterInput input) {
    setUpdatedEndpointAttributes(endpoint, input);
    updateEndpoint(endpoint);
    Agent agent = new Agent();
    setNewAgentAttributes(input, agent);
    setUpdatedAgentAttributes(agent, input, endpoint);
    return agentService.createOrUpdateAgent(agent);
  }

  private Agent createOrUpdateAgent(Endpoint endpoint, AgentRegisterInput input) {
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

  private void setUpdatedEndpointAttributes(Endpoint endpoint, AgentRegisterInput input) {
    // Hostname not updated by Crowdstrike because Crowdstrike hostname is 15 length max
    if (!CROWDSTRIKE_EXECUTOR_TYPE.equals(input.getExecutor().getType())) {
      endpoint.setHostname(input.getHostname());
    }
    endpoint.setIps(EndpointMapper.mergeAddressArrays(endpoint.getIps(), input.getIps()));
    endpoint.setSeenIp(input.getSeenIp());
    endpoint.setMacAddresses(
        EndpointMapper.mergeAddressArrays(endpoint.getMacAddresses(), input.getMacAddresses()));
  }

  private Agent updateExistingAgent(Agent agent, AgentRegisterInput input) {
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    setUpdatedEndpointAttributes(endpoint, input);
    updateEndpoint(endpoint);
    setUpdatedAgentAttributes(agent, input, endpoint);
    return agentService.createOrUpdateAgent(agent);
  }

  private void setUpdatedAgentAttributes(Agent agent, AgentRegisterInput input, Endpoint endpoint) {
    agent.setAsset(endpoint);
    agent.setLastSeen(input.getLastSeen());
    agent.setExternalReference(input.getExternalReference());
    // For OpenBAS agent
    agent.setVersion(input.getAgentVersion());
  }

  private Agent createNewEndpointAndAgent(AgentRegisterInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setIps(input.getIps());
    endpoint.setSeenIp(input.getSeenIp());
    endpoint.setMacAddresses(input.getMacAddresses());
    createEndpoint(endpoint);
    Agent agent = new Agent();
    setUpdatedAgentAttributes(agent, input, endpoint);
    setNewAgentAttributes(input, agent);
    return agentService.createOrUpdateAgent(agent);
  }

  private void setNewAgentAttributes(AgentRegisterInput input, Agent agent) {
    agent.setPrivilege(input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard);
    agent.setDeploymentMode(
        input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session);
    agent.setExecutedByUser(input.getExecutedByUser());
    agent.setExecutor(input.getExecutor());
  }

  private AgentRegisterInput toAgentEndpoint(EndpointRegisterInput input) {
    AgentRegisterInput agentInput = new AgentRegisterInput();
    agentInput.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
    agentInput.setLastSeen(Instant.now());
    agentInput.setExternalReference(input.getExternalReference());
    agentInput.setIps(input.getIps());
    agentInput.setSeenIp(input.getSeenIp());
    agentInput.setMacAddresses(input.getMacAddresses());
    agentInput.setHostname(input.getHostname());
    agentInput.setAgentVersion(input.getAgentVersion());
    agentInput.setName(input.getName());
    agentInput.setPlatform(input.getPlatform());
    agentInput.setArch(input.getArch());
    agentInput.setService(input.isService());
    agentInput.setElevated(input.isElevated());
    agentInput.setExecutedByUser(input.getExecutedByUser());
    agentInput.setInstallationMode(input.getInstallationMode());
    return agentInput;
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

  public String generateInstallCommand(String platform, String token, String installationMode)
      throws IOException {
    if (token == null || token.isEmpty()) {
      throw new IllegalArgumentException("Token must not be null or empty.");
    }
    String installerName = OPENBAS_AGENT_INSTALLER;
    if (installationMode != null && !installationMode.equals(SERVICE)) {
      installerName = installerName.concat("-").concat(installationMode);
    }
    return getFileOrDownloadFromJfrog(platform, installerName, token);
  }

  public String generateUpgradeCommand(String platform, String installationMode)
      throws IOException {
    String upgradeName = OPENBAS_AGENT_UPGRADE;
    if (installationMode != null && !installationMode.equals(SERVICE)) {
      upgradeName = upgradeName.concat("-").concat(installationMode);
    }
    return getFileOrDownloadFromJfrog(platform, upgradeName, adminToken);
  }
}
