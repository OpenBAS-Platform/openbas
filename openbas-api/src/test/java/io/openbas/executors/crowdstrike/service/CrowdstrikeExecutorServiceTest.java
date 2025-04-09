package io.openbas.executors.crowdstrike.service;

import static io.openbas.utils.Time.toInstant;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openbas.database.model.*;
import io.openbas.executors.ExecutorService;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import io.openbas.executors.crowdstrike.model.CrowdStrikeDevice;
import io.openbas.executors.crowdstrike.model.CrowdStrikeHostGroup;
import io.openbas.executors.crowdstrike.model.ResourcesGroups;
import io.openbas.executors.model.AgentRegisterInput;
import io.openbas.service.AgentService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
import io.openbas.utils.EndpointMapper;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class CrowdstrikeExecutorServiceTest {

  public static final String HOST_GROUP_CS = "hostGroupCs";
  private String DATE;

  @Mock private ExecutorService executorService;

  @Mock private CrowdStrikeExecutorClient client;

  @Mock private CrowdStrikeExecutorConfig config;

  @Mock private CrowdStrikeExecutorContextService crowdstrikeExecutorContextService;

  @Mock private AssetGroupService assetGroupService;

  @Mock private EndpointService endpointService;

  @Mock private AgentService agentService;

  @Mock private Executor executor;

  @InjectMocks private CrowdStrikeExecutorService crowdStrikeExecutorService;

  private Endpoint crowdstrikeEndpoint;
  private Agent agentEndpoint;
  private CrowdStrikeDevice crowdstrikeAgent;
  private Executor crowdstrikeExecutor;
  private ResourcesGroups resourcesGroups;
  private CrowdStrikeHostGroup crowdstrikeHostGroup;

  private void initCsAgent() {
    crowdstrikeAgent = new CrowdStrikeDevice();
    crowdstrikeAgent.setDevice_id("externalRefCS");
    crowdstrikeAgent.setHostname("hostnameCS");
    crowdstrikeAgent.setPlatform_name("Windows");
    crowdstrikeAgent.setExternal_ip("1.1.1.1");
    crowdstrikeAgent.setLocal_ip("1.1.1.2");
    crowdstrikeAgent.setConnection_ip("1.1.1.3");
    crowdstrikeAgent.setMac_address("AA:AA:AA:AA:AA:AA");
    crowdstrikeAgent.setLast_seen(DATE);
  }

  private void initCsExecutor() {
    crowdstrikeExecutor = new Executor();
    crowdstrikeExecutor.setName(CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_NAME);
    crowdstrikeExecutor.setType(CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE);
  }

  private void initCsEndpoint() {
    crowdstrikeEndpoint = new Endpoint();
    crowdstrikeEndpoint.setName(crowdstrikeAgent.getHostname());
    crowdstrikeEndpoint.setDescription("Asset collected by CS executor context.");
    crowdstrikeEndpoint.setIps(
        EndpointMapper.setIps(new String[] {crowdstrikeAgent.getConnection_ip()}));
    crowdstrikeEndpoint.setHostname(crowdstrikeAgent.getHostname());
    crowdstrikeEndpoint.setPlatform(Endpoint.PLATFORM_TYPE.Windows);
    crowdstrikeEndpoint.setArch(Endpoint.PLATFORM_ARCH.x86_64);
  }

  private void initAgentEndpoint() {
    agentEndpoint = new Agent();
    agentEndpoint.setExecutor(crowdstrikeExecutor);
    agentEndpoint.setExternalReference(crowdstrikeAgent.getDevice_id());
    agentEndpoint.setPrivilege(io.openbas.database.model.Agent.PRIVILEGE.admin);
    agentEndpoint.setDeploymentMode(Agent.DEPLOYMENT_MODE.service);
    agentEndpoint.setExecutedByUser(Agent.ADMIN_SYSTEM_WINDOWS);
    agentEndpoint.setLastSeen(toInstant(DATE));
    agentEndpoint.setAsset(crowdstrikeEndpoint);
  }

  @BeforeEach
  void setUp() {
    Instant now = Instant.now();
    DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.systemDefault());
    DATE = formatter.format(now);

    initCsAgent();
    initCsEndpoint();
    initCsExecutor();
    initAgentEndpoint();

    resourcesGroups = new ResourcesGroups();
    crowdstrikeHostGroup = new CrowdStrikeHostGroup();
    crowdstrikeHostGroup.setId(HOST_GROUP_CS);
    crowdstrikeHostGroup.setName("crowdstrike");
    resourcesGroups.setResources(List.of(crowdstrikeHostGroup));
    when(config.getHostGroup()).thenReturn(HOST_GROUP_CS);
    when(client.hostGroup(HOST_GROUP_CS)).thenReturn(resourcesGroups);
  }

  @Test
  void test_run_crowdstrike() {
    when(client.devices(HOST_GROUP_CS)).thenReturn(List.of(crowdstrikeAgent));
    crowdStrikeExecutorService.run();

    ArgumentCaptor<String> executorTypeCaptor = ArgumentCaptor.forClass(String.class);
    verify(agentService).getAgentsByExecutorType(executorTypeCaptor.capture());
    assertEquals(crowdstrikeExecutor.getType(), executorTypeCaptor.getValue());

    ArgumentCaptor<List<AgentRegisterInput>> inputsCaptor = ArgumentCaptor.forClass(List.class);
    ArgumentCaptor<List<Agent>> agents = ArgumentCaptor.forClass(List.class);
    verify(endpointService).syncAgentsEndpoints(inputsCaptor.capture(), agents.capture());
    assertEquals(1, inputsCaptor.getValue().size());
    assertEquals(0, agents.getValue().size());

    ArgumentCaptor<AssetGroup> assetGroupCaptor = ArgumentCaptor.forClass(AssetGroup.class);
    verify(assetGroupService)
        .createOrUpdateAssetGroupWithoutDynamicAssets(assetGroupCaptor.capture());
    assertEquals(HOST_GROUP_CS, assetGroupCaptor.getValue().getExternalReference());
  }
}
