package io.openbas.rest.payload.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint.PLATFORM_TYPE;
import io.openbas.database.model.PayloadArgument;
import io.openbas.database.model.PayloadPrerequisite;
import io.openbas.database.model.PlatformArchitecture;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayloadUpdateInput {
  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("payload_name")
  private String name;

  @JsonProperty("payload_platforms")
  private PLATFORM_TYPE[] platforms;

  @JsonProperty("payload_description")
  private String description;

  @JsonProperty("command_executor")
  @Schema(nullable = true)
  private String executor;

  @JsonProperty("command_content")
  @Schema(nullable = true)
  private String content;

  @RequiredArchIfType(validTypes = {"Command", "Executable"})
  @JsonProperty("executable_arch")
  private PlatformArchitecture executableArch;

  @JsonProperty("executable_file")
  private String executableFile;

  @JsonProperty("file_drop_file")
  private String fileDropFile;

  @JsonProperty("dns_resolution_hostname")
  private String hostname;

  @JsonProperty("payload_arguments")
  private List<PayloadArgument> arguments;

  @JsonProperty("payload_prerequisites")
  private List<PayloadPrerequisite> prerequisites;

  @JsonProperty("payload_cleanup_executor")
  @Schema(nullable = true)
  private String cleanupExecutor;

  @JsonProperty("payload_cleanup_command")
  @Schema(nullable = true)
  private String cleanupCommand;

  @JsonProperty("payload_tags")
  private List<String> tagIds = new ArrayList<>();

  @JsonProperty("payload_attack_patterns")
  private List<String> attackPatternsIds = new ArrayList<>();
}
