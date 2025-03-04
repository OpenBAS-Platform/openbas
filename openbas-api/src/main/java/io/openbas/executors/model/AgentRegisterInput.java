package io.openbas.executors.model;

import static java.time.Instant.now;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Executor;
import io.openbas.utils.EndpointMapper;
import java.time.Instant;
import lombok.Data;

@Data
public class AgentRegisterInput {

  private String name;
  private String[] ips;
  private String seenIp;
  private String hostname;
  private String agentVersion;
  private Endpoint.PLATFORM_TYPE platform;
  private Endpoint.PLATFORM_ARCH arch;
  private String[] macAddresses;
  private Instant lastSeen;
  private String externalReference;
  private boolean isService;
  private boolean isElevated;
  private String executedByUser;
  private Executor executor;
  private String processName;
  private String installationMode;

  public void setMacAddresses(String[] macAddresses) {
    this.macAddresses = EndpointMapper.setMacAddresses(macAddresses);
  }

  public void setIps(String[] ips) {
    this.ips = EndpointMapper.setIps(ips);
  }

  public void setHostname(String hostname) {
    this.hostname = hostname.toLowerCase();
  }

  public boolean isActive() {
    return this.getLastSeen() != null
        && (now().toEpochMilli() - this.getLastSeen().toEpochMilli()) < Agent.ACTIVE_THRESHOLD;
  }
}
