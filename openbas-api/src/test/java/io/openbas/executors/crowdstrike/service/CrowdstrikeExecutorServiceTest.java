package io.openbas.executors.crowdstrike.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openbas.database.model.*;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import io.openbas.executors.crowdstrike.model.CrowdStrikeDevice;
import io.openbas.executors.crowdstrike.model.CrowdStrikeHostGroup;
import io.openbas.executors.crowdstrike.model.ResourcesGroups;
import io.openbas.executors.model.AgentRegisterInput;
import io.openbas.service.AgentService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
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

  @Mock private CrowdStrikeExecutorClient client;

  @Mock private CrowdStrikeExecutorConfig config;

  @Mock private AssetGroupService assetGroupService;

  @Mock private EndpointService endpointService;

  @Mock private AgentService agentService;

  @InjectMocks private CrowdStrikeExecutorService crowdStrikeExecutorService;

  private CrowdStrikeDevice crowdstrikeAgent;
  private Executor crowdstrikeExecutor;

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

  @BeforeEach
  void setUp() {
    Instant now = Instant.now();
    DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneId.systemDefault());
    DATE = formatter.format(now);

    initCsAgent();
    initCsExecutor();

    ResourcesGroups resourcesGroups = new ResourcesGroups();
    CrowdStrikeHostGroup crowdstrikeHostGroup = new CrowdStrikeHostGroup();
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
