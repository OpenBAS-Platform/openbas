package io.openbas.service;

import static io.openbas.database.model.Filters.isEmptyFilterGroup;
import static io.openbas.database.specification.EndpointSpecification.*;
import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.ArchitectureFilterUtils.handleEndpointFilter;
import static io.openbas.utils.FilterUtilsJpa.computeFilterGroupJpa;
import static io.openbas.utils.pagination.PaginationUtils.buildPageable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.executors.model.AgentRegisterInput;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.mapper.EndpointMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
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
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class EndpointService {

  public static final int DELETE_TTL = 86400000; // 24 hours
  public static final String OPENBAS_AGENT_INSTALLER = "openbas-agent-installer";
  public static final String OPENBAS_AGENT_UPGRADE = "openbas-agent-upgrade";
  public static final String SERVICE = "service";
  public static final String SERVICE_USER = "service-user";
  public static final String SESSION_USER = "session-user";

  public static String JFROG_BASE = "https://filigran.jfrog.io/artifactory";

  public static final String OPENBAS_INSTALL_DIR_WINDOWS_SERVICE =
      "C:\\Program Files (x86)\\Filigran\\OBAS Agent";
  public static final String OPENBAS_INSTALL_DIR_WINDOWS_SERVICE_USER = ".openbas";
  public static final String OPENBAS_INSTALL_DIR_WINDOWS_SESSION_USER = "$HOME\\.openbas";
  public static final String OPENBAS_INSTALL_DIR_UNIX_SERVICE = "/opt/openbas-agent";
  public static final String OPENBAS_INSTALL_DIR_UNIX_SERVICE_USER = ".local/openbas-agent-service";
  public static final String OPENBAS_INSTALL_DIR_UNIX_SESSION_USER = ".local/openbas-agent-session";

  public static final String OPENBAS_SERVICE_NAME_WINDOWS_SERVICE = "OBASAgentService";
  public static final String OPENBAS_SERVICE_NAME_WINDOWS_SERVICE_USER = "OBASAgent-Service";
  public static final String OPENBAS_SERVICE_NAME_WINDOWS_SESSION_USER = "OBASAgent-Session";
  public static final String OPENBAS_SERVICE_NAME_UNIX_SERVICE = "openbas-agent";
  public static final String OPENBAS_SERVICE_NAME_UNIX_SERVICE_USER = "openbas-agent";
  public static final String OPENBAS_SERVICE_NAME_UNIX_SESSION_USER = "openbas-agent-session";

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
  private final AssetGroupRepository assetGroupRepository;
  private final AssetAgentJobRepository assetAgentJobRepository;
  private final TagRepository tagRepository;
  private final AgentService agentService;
  private final AssetService assetService;

  // -- CRUD --
  public Endpoint createEndpoint(@NotNull final Endpoint endpoint) {
    return this.endpointRepository.save(endpoint);
  }

  public Endpoint createEndpoint(@NotNull final EndpointInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setIps(EndpointMapper.setIps(input.getIps()));
    endpoint.setMacAddresses(EndpointMapper.setMacAddresses(input.getMacAddresses()));
    endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    endpoint.setEoL(input.isEol());
    return createEndpoint(endpoint);
  }

  public Endpoint endpoint(@NotBlank final String endpointId) {
    return this.endpointRepository
        .findById(endpointId)
        .orElseThrow(() -> new ElementNotFoundException("Endpoint not found"));
  }

  public List<Endpoint> findEndpointByHostnameAndAtLeastOneIp(
      @NotBlank final String hostname, @NotNull final String[] ips) {
    return this.endpointRepository.findByHostnameAndAtleastOneIp(hostname, ips);
  }

  public List<Endpoint> findEndpointByHostnameAndAtLeastOneMacAddress(
      @NotBlank final String hostname, @NotNull final String[] macAddresses) {
    return this.endpointRepository.findByHostnameAndAtleastOneMacAddress(hostname, macAddresses);
  }

  public Optional<Endpoint> findEndpointByExternalReference(
      @NotNull final String externalReference) {
    return this.endpointRepository.findByExternalReference(externalReference).stream().findFirst();
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

  public List<Endpoint> endpoints(List<String> endpointIds) {
    return fromIterable(this.endpointRepository.findAll(fromIds(endpointIds)));
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
                findEndpointsForInjectionOrAgentlessEndpoints().and(specification), pageable),
        handleEndpointFilter(searchPaginationInput),
        Endpoint.class);
  }

  public Page<Endpoint> searchManagedEndpoints(
      String assetGroupId, SearchPaginationInput searchPaginationInput) {
    AssetGroup assetGroup =
        assetGroupRepository
            .findById(assetGroupId)
            .orElseThrow(() -> new IllegalArgumentException("Asset group not found"));

    Specification<Endpoint> specificationStatic =
        findEndpointsForAssetGroup(assetGroupId)
            .and(findEndpointsForInjectionOrAgentlessEndpoints());

    if (!isEmptyFilterGroup(assetGroup.getDynamicFilter())) {
      Specification<Endpoint> specificationDynamic =
          computeFilterGroupJpa(assetGroup.getDynamicFilter());
      Specification<Endpoint> specificationDynamicWithInjection =
          specificationDynamic.and(findEndpointsForInjectionOrAgentlessEndpoints());

      Page<Endpoint> dynamicResult =
          buildPaginationJPA(
              (Specification<Endpoint> specification, Pageable pageable) ->
                  this.endpointRepository.findAll(
                      specificationDynamicWithInjection.and(specification), pageable),
              handleEndpointFilter(searchPaginationInput),
              Endpoint.class);
      Page<Endpoint> staticResult =
          buildPaginationJPA(
              (Specification<Endpoint> specification, Pageable pageable) ->
                  this.endpointRepository.findAll(specificationStatic.and(specification), pageable),
              handleEndpointFilter(searchPaginationInput),
              Endpoint.class);
      List<Endpoint> mergedContent =
          Stream.concat(dynamicResult.getContent().stream(), staticResult.getContent().stream())
              .distinct()
              .limit(searchPaginationInput.getSize())
              .collect(Collectors.toList());

      long total = dynamicResult.getTotalElements() + staticResult.getTotalElements();

      Pageable pageable = buildPageable(searchPaginationInput, Endpoint.class);
      return new PageImpl<>(mergedContent, pageable, total);
    } else {
      return buildPaginationJPA(
          (Specification<Endpoint> specification, Pageable pageable) ->
              this.endpointRepository.findAll(specificationStatic.and(specification), pageable),
          handleEndpointFilter(searchPaginationInput),
          Endpoint.class);
    }
  }

  public Endpoint updateEndpoint(
      @NotBlank final String endpointId, @NotNull final EndpointInput input) {
    Endpoint toUpdate = this.endpoint(endpointId);
    toUpdate.setUpdateAttributes(input);
    toUpdate.setEoL(input.isEol());
    toUpdate.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return updateEndpoint(toUpdate);
  }

  // -- INSTALLATION AGENT --
  @Transactional
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

  public List<Asset> syncAgentsEndpoints(
      List<AgentRegisterInput> inputs, List<Agent> existingAgents) {
    List<Agent> agentsToSave = new ArrayList<>();
    List<Asset> endpointsToSave = new ArrayList<>();
    Endpoint endpointToSave;
    Agent agentToSave;
    // Update agents/endpoints with external reference
    Set<String> inputsExternalRefs =
        inputs.stream().map(AgentRegisterInput::getExternalReference).collect(Collectors.toSet());
    if (!inputsExternalRefs.isEmpty()) {
      Set<Agent> agentsToUpdate =
          existingAgents.stream()
              .filter(agent -> inputsExternalRefs.contains(agent.getExternalReference()))
              .collect(Collectors.toSet());
      Map<String, AgentRegisterInput> inputsByExternalReference =
          inputs.stream()
              .collect(
                  Collectors.toMap(AgentRegisterInput::getExternalReference, agent2 -> agent2));
      for (Agent agentToUpdate : agentsToUpdate) {
        final AgentRegisterInput inputToSave =
            inputsByExternalReference.get(agentToUpdate.getExternalReference());
        endpointToSave = (Endpoint) agentToUpdate.getAsset();
        setUpdatedEndpointAttributes(endpointToSave, inputToSave);
        agentToUpdate.setAsset(endpointToSave);
        agentToUpdate.setLastSeen(inputToSave.getLastSeen());
        // TODO: Making this function transactional is not helping to solve tags
        // addSourceTagToEndpoint(endpointToSave, inputToSave);
        endpointsToSave.add(endpointToSave);
        agentsToSave.add(agentToUpdate);
        inputs.removeIf(
            input -> input.getExternalReference().equals(inputToSave.getExternalReference()));
      }
    }
    // Update agents/endpoints with mac address
    String[] inputsMacAddresses =
        inputs.stream().map(AgentRegisterInput::getMacAddresses).toList().stream()
            .flatMap(Arrays::stream)
            .toArray(String[]::new);
    if (inputsMacAddresses.length > 0) {
      List<Endpoint> endpointsToUpdate = findEndpointsByMacAddresses(inputsMacAddresses);
      Optional<AgentRegisterInput> optionalInputToSave;
      for (Endpoint endpointToUpdate : endpointsToUpdate) {
        optionalInputToSave =
            inputs.stream()
                .filter(
                    input ->
                        Arrays.stream(endpointToUpdate.getMacAddresses())
                            .anyMatch(
                                macAddress ->
                                    Arrays.asList(input.getMacAddresses()).contains(macAddress)))
                .findFirst();
        if (optionalInputToSave.isPresent()) {
          // If no existing agent Crowdstrike in this endpoint, add to it
          if (existingAgents.stream()
              .noneMatch(agent -> agent.getAsset().getId().equals(endpointToUpdate.getId()))) {
            final AgentRegisterInput inputToSave = optionalInputToSave.get();
            setUpdatedEndpointAttributes(endpointToUpdate, inputToSave);
            agentToSave = new Agent();
            setNewAgentAttributes(inputToSave, agentToSave);
            setUpdatedAgentAttributes(agentToSave, inputToSave, endpointToUpdate);
            // TODO: Making this function transactional is not helping to solve tags
            // addSourceTagToEndpoint(endpointToUpdate, inputToSave);
            endpointsToSave.add(endpointToUpdate);
            agentsToSave.add(agentToSave);
            inputs.removeIf(
                input -> Arrays.equals(input.getMacAddresses(), inputToSave.getMacAddresses()));
          }
        }
      }
    }
    // Create new agents/endpoints
    if (!inputs.isEmpty()) {
      for (AgentRegisterInput inputToUpdate : inputs) {
        endpointToSave = new Endpoint();
        endpointToSave.setUpdateAttributes(inputToUpdate);
        endpointToSave.setIps(inputToUpdate.getIps());
        endpointToSave.setSeenIp(inputToUpdate.getSeenIp());
        endpointToSave.setMacAddresses(inputToUpdate.getMacAddresses());
        // TODO: Making this function transactional is not helping to solve tags
        // addSourceTagToEndpoint(endpointToSave, inputToUpdate);
        endpointsToSave.add(endpointToSave);
        agentToSave = new Agent();
        setNewAgentAttributes(inputToUpdate, agentToSave);
        setUpdatedAgentAttributes(agentToSave, inputToUpdate, endpointToSave);
        agentsToSave.add(agentToSave);
      }
    }
    // Save all in database
    List<Asset> endpoints = fromIterable(assetService.saveAllAssets(endpointsToSave));
    agentService.saveAllAgents(agentsToSave);
    return endpoints;
  }

  @Transactional
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
                (Endpoint) existingAgents.getFirst().getAsset(), agentInput);
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
    Endpoint endpoint = (Endpoint) agent.getAsset();
    if (agent.getParent() == null && !agent.getVersion().equals(version)) {
      AssetAgentJob assetAgentJob = new AssetAgentJob();
      assetAgentJob.setCommand(
          generateUpgradeCommand(
              endpoint.getPlatform().name(),
              input.getInstallationMode(),
              input.getInstallationDirectory(),
              input.getServiceName()));
      assetAgentJob.setAgent(agent);
      assetAgentJobRepository.save(assetAgentJob);
    }
    return endpoint;
  }

  private void addSourceTagToEndpoint(Endpoint endpoint, AgentRegisterInput input) {
    Set<Tag> existingTags =
        endpoint.getTags() != null ? new HashSet<>(endpoint.getTags()) : new HashSet<>();
    existingTags.removeIf(t -> t.getName() != null && t.getName().startsWith("source:"));
    String tagName = "source:" + input.getExecutor().getName().toLowerCase();
    Optional<Tag> tag = tagRepository.findByName(tagName);
    if (tag.isEmpty()) {
      Tag newTag = new Tag();
      newTag.setColor(input.getExecutor().getBackgroundColor());
      newTag.setName(tagName);
      tagRepository.save(newTag);
      existingTags.add(newTag);
    } else {
      existingTags.add(tag.get());
    }
    endpoint.setTags(existingTags);
  }

  private Agent updateExistingEndpointAndManageAgent(Endpoint endpoint, AgentRegisterInput input) {
    setUpdatedEndpointAttributes(endpoint, input);
    addSourceTagToEndpoint(endpoint, input);
    updateEndpoint(endpoint);
    return createOrUpdateAgent(endpoint, input);
  }

  private Agent updateExistingAgent(Agent agent, AgentRegisterInput input) {
    Endpoint endpoint = (Endpoint) agent.getAsset();
    setUpdatedEndpointAttributes(endpoint, input);
    addSourceTagToEndpoint(endpoint, input);
    updateEndpoint(endpoint);
    setUpdatedAgentAttributes(agent, input, endpoint);
    return agentService.createOrUpdateAgent(agent);
  }

  private Agent updateExistingEndpointAndCreateAgent(Endpoint endpoint, AgentRegisterInput input) {
    setUpdatedEndpointAttributes(endpoint, input);
    addSourceTagToEndpoint(endpoint, input);
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
    // Hostname and arch not updated by Crowdstrike because Crowdstrike hostname is 15 length max
    // and arch is hard coded
    if (!CROWDSTRIKE_EXECUTOR_TYPE.equals(input.getExecutor().getType())) {
      endpoint.setHostname(input.getHostname());
      endpoint.setArch(input.getArch());
    }
    endpoint.setIps(EndpointMapper.mergeAddressArrays(endpoint.getIps(), input.getIps()));
    endpoint.setSeenIp(input.getSeenIp());
    endpoint.setMacAddresses(
        EndpointMapper.mergeAddressArrays(endpoint.getMacAddresses(), input.getMacAddresses()));
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
    addSourceTagToEndpoint(endpoint, input);
    createEndpoint(endpoint);
    Agent agent = new Agent();
    setUpdatedAgentAttributes(agent, input, endpoint);
    setNewAgentAttributes(input, agent);
    return agentService.createOrUpdateAgent(agent);
  }

  private void setNewAgentAttributes(AgentRegisterInput input, Agent agent) {
    if (CROWDSTRIKE_EXECUTOR_TYPE.equals(input.getExecutor().getType())) {
      agent.setId(input.getExternalReference());
    }
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
    agentInput.setInstallationDirectory(input.getInstallationDirectory());
    agentInput.setServiceName(input.getServiceName());
    return agentInput;
  }

  public String getFileOrDownloadFromJfrog(
      String platform,
      String file,
      String adminToken,
      String installationDir,
      String serviceNameOrPrefix)
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

    if (installationDir == null) {
      installationDir = "";
    }

    return IOUtils.toString(in, StandardCharsets.UTF_8)
        .replace("${OPENBAS_URL}", openBASConfig.getBaseUrlForAgent())
        .replace("${OPENBAS_TOKEN}", adminToken)
        .replace(
            "${OPENBAS_UNSECURED_CERTIFICATE}",
            String.valueOf(openBASConfig.isUnsecuredCertificate()))
        .replace("${OPENBAS_WITH_PROXY}", String.valueOf(openBASConfig.isWithProxy()))
        .replace("${OPENBAS_SERVICE_NAME}", serviceNameOrPrefix)
        .replace("${OPENBAS_INSTALL_DIR}", installationDir);
  }

  public String generateServiceNameOrPrefix(
      String platform, String installationMode, String serviceNameOrPrefix) {
    if (serviceNameOrPrefix != null && !serviceNameOrPrefix.equals("")) {
      return serviceNameOrPrefix;
    }
    if (platform.equalsIgnoreCase(Endpoint.PLATFORM_TYPE.Windows.name())) {
      if (installationMode != null && installationMode.equals(SERVICE)) {
        return OPENBAS_SERVICE_NAME_WINDOWS_SERVICE;
      }
      if (installationMode != null && installationMode.equals(SERVICE_USER)) {
        return OPENBAS_SERVICE_NAME_WINDOWS_SERVICE_USER;
      }
      if (installationMode != null && installationMode.equals(SESSION_USER)) {
        return OPENBAS_SERVICE_NAME_WINDOWS_SESSION_USER;
      }
      return OPENBAS_SERVICE_NAME_WINDOWS_SERVICE;
    } else {
      if (installationMode != null && installationMode.equals(SERVICE)) {
        return OPENBAS_SERVICE_NAME_UNIX_SERVICE;
      }
      if (installationMode != null && installationMode.equals(SERVICE_USER)) {
        return OPENBAS_SERVICE_NAME_UNIX_SERVICE_USER;
      }
      if (installationMode != null && installationMode.equals(SESSION_USER)) {
        return OPENBAS_SERVICE_NAME_UNIX_SESSION_USER;
      }
      return OPENBAS_SERVICE_NAME_UNIX_SERVICE;
    }
  }

  public String generateInstallationDir(
      String platform, String installationMode, String installationDir) {
    if (installationDir != null && !installationDir.equals("")) {
      return installationDir;
    }
    if (platform.equalsIgnoreCase(Endpoint.PLATFORM_TYPE.Windows.name())) {
      if (installationMode != null && installationMode.equals(SERVICE)) {
        return OPENBAS_INSTALL_DIR_WINDOWS_SERVICE;
      }
      if (installationMode != null && installationMode.equals(SERVICE_USER)) {
        return OPENBAS_INSTALL_DIR_WINDOWS_SERVICE_USER;
      }
      if (installationMode != null && installationMode.equals(SESSION_USER)) {
        return OPENBAS_INSTALL_DIR_WINDOWS_SESSION_USER;
      }
      return OPENBAS_INSTALL_DIR_WINDOWS_SERVICE;
    } else {
      if (installationMode != null && installationMode.equals(SERVICE)) {
        return OPENBAS_INSTALL_DIR_UNIX_SERVICE;
      }
      if (installationMode != null && installationMode.equals(SERVICE_USER)) {
        return OPENBAS_INSTALL_DIR_UNIX_SERVICE_USER;
      }
      if (installationMode != null && installationMode.equals(SESSION_USER)) {
        return OPENBAS_INSTALL_DIR_UNIX_SESSION_USER;
      }
      return OPENBAS_INSTALL_DIR_UNIX_SERVICE;
    }
  }

  public String generateInstallCommand(
      String platform,
      String token,
      String installationMode,
      String installationDir,
      String serviceNameOrPrefix)
      throws IOException {
    if (token == null || token.isEmpty()) {
      throw new IllegalArgumentException("Token must not be null or empty.");
    }
    String installerName = OPENBAS_AGENT_INSTALLER;
    if (installationMode != null && !installationMode.equals(SERVICE)) {
      installerName = installerName.concat("-").concat(installationMode);
    }
    installationDir = generateInstallationDir(platform, installationMode, installationDir);
    serviceNameOrPrefix =
        generateServiceNameOrPrefix(platform, installationMode, serviceNameOrPrefix);
    return getFileOrDownloadFromJfrog(
        platform, installerName, token, installationDir, serviceNameOrPrefix);
  }

  public String generateUpgradeCommand(
      String platform, String installationMode, String installationDir, String serviceNameOrPrefix)
      throws IOException {
    String upgradeName = OPENBAS_AGENT_UPGRADE;
    if (installationMode != null && !installationMode.equals(SERVICE)) {
      upgradeName = upgradeName.concat("-").concat(installationMode);
    }
    installationDir = generateInstallationDir(platform, installationMode, installationDir);
    serviceNameOrPrefix =
        generateServiceNameOrPrefix(platform, installationMode, serviceNameOrPrefix);
    return getFileOrDownloadFromJfrog(
        platform, upgradeName, adminToken, installationDir, serviceNameOrPrefix);
  }

  public List<Endpoint> endpointsForScenario(String scenarioId) {
    return this.endpointRepository.findDistinctByInjectsScenarioId(scenarioId);
  }

  public List<Endpoint> endpointsForSimulation(String simulationId) {
    return this.endpointRepository.findDistinctByInjectsExerciseId(simulationId);
  }

  // -- OPTIONS --
  public List<FilterUtilsJpa.Option> getOptionsByNameLinkedToFindings(
      String searchText, String sourceId, Pageable pageable) {
    String trimmedSearchText = StringUtils.trimToNull(searchText);
    String trimmedSourceId = StringUtils.trimToNull(sourceId);

    List<Object[]> results;

    if (trimmedSourceId == null) {
      results = endpointRepository.findAllByNameLinkedToFindings(trimmedSearchText, pageable);
    } else {
      results =
          endpointRepository.findAllByNameLinkedToFindingsWithContext(
              trimmedSourceId, trimmedSearchText, pageable);
    }

    return results.stream()
        .map(i -> new FilterUtilsJpa.Option((String) i[0], (String) i[1]))
        .toList();
  }
}
