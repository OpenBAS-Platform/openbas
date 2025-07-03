package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class StatusPayload {

  // Need a big migration to remove this shit from DB and push the new one

  @JsonProperty("payload_type")
  private String type;

  @JsonProperty("payload_collector_type")
  private String collectorType;

  @JsonProperty("payload_name")
  private String name;

  @JsonProperty("payload_description")
  private String description;

  @JsonProperty("payload_platforms")
  private Endpoint.PLATFORM_TYPE[] platforms;

  @JsonProperty("payload_attack_patterns")
  private List<String> attackPatterns;

  @JsonProperty("payload_cleanup_executor")
  private String cleanupExecutor;

  @JsonProperty("payload_cleanup_command")
  private List<String> cleanupCommand;

  @JsonProperty("payload_arguments")
  private List<PayloadArgument> arguments = new ArrayList<>();

  @JsonProperty("payload_prerequisites")
  private List<PayloadPrerequisite> prerequisites = new ArrayList<>();

  @JsonProperty("payload_external_id")
  private String externalId;

  // -- COMMAND -- -> create a child class ?

  @JsonProperty("command_executor")
  private String executor;

  @JsonProperty("command_content")
  private String content;

  // -- DNS -- -> create a child class ?

  @JsonProperty("dns_resolution_hostname")
  private String hostname;

  // -- EXECUTABLE -- -> create a child class ?

  @JsonProperty("executable_file")
  private String executableFile;

  // -- FILE DROP -- -> create a child class ?

  @JsonProperty("file_drop_file")
  private String fileDropFile;

  // -- NETWORK TRAFFIC -- -> create a child class ?

  @JsonProperty("network_traffic_ip_src")
  @NotNull
  private String ipSrc;

  @JsonProperty("network_traffic_ip_dst")
  @NotNull
  private String ipDst;

  @JsonProperty("network_traffic_port_src")
  @NotNull
  private Integer portSrc;

  @JsonProperty("network_traffic_port_dst")
  @NotNull
  private Integer portDst;

  @JsonProperty("network_traffic_protocol")
  @NotNull
  private String protocol;
}
