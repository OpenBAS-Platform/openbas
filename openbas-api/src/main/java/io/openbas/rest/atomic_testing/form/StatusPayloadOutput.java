package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.*;
import io.openbas.rest.payload.output.output_parser.OutputParserSimple;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.*;

@Data
@Builder
public class StatusPayloadOutput {

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

  @JsonProperty("payload_tags")
  private Set<String> tags;

  @JsonProperty("payload_obfuscator")
  private String obfuscator;

  @JsonProperty("payload_execution_arch")
  @Enumerated(EnumType.STRING)
  private Payload.PAYLOAD_EXECUTION_ARCH executionArch =
      Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES;

  @JsonProperty("payload_output_parsers")
  private Set<OutputParserSimple> payloadOutputParsers;

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

}
