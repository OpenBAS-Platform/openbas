package io.openbas.rest.atomic_testing.form;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class InjectResultDTO {

  @Schema(description = "Id")
  @JsonProperty("inject_id")
  @NotNull
  private String id;

  @Schema(description = "Title")
  @JsonProperty("inject_title")
  @NotNull
  private String title;

  @Schema(description = "Description")
  @JsonProperty("inject_description")
  @NotNull
  private String description;

  @JsonProperty("inject_content")
  private ObjectNode content;

  @JsonProperty("inject_commands_lines")
  private InjectStatusCommandLine commandsLines;

  @JsonProperty("inject_expectations")
  private List<InjectExpectationDTO> expectations;

  @JsonProperty("inject_type")
  private String type;

  @Schema(description = "Kill Chain Phases")
  @JsonProperty("inject_kill_chain_phases")
  @NotNull
  private List<KillChainPhaseDTO> killChainPhases;

  @Schema(description = "Attack Patterns")
  @JsonProperty("inject_attack_patterns")
  @NotNull
  private List<AttackPatternDTO> attackPatterns;

  @Schema(description = "Full contract")
  @JsonProperty("inject_injector_contract")
  @NotNull
  private InjectorContract injectorContract;

  @JsonProperty("inject_status")
  private InjectStatusDTO status;

  @Schema(
      description = "Specifies the categories of targetResults for atomic testing.",
      example = "assets, asset groups, teams, players")
  @JsonProperty("inject_targets")
  @NotNull
  private List<InjectTargetWithResult> targets;

  @Default
  @Schema(description = "Result of expectations")
  @JsonProperty("inject_expectation_results")
  @NotNull
  private List<ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  @JsonProperty("injects_tags")
  private List<String> tagIds;

  @JsonProperty("injects_documents")
  private List<String> documents;

  @JsonProperty("inject_ready")
  private Boolean isReady;

  @JsonProperty("inject_updated_at")
  private Instant updatedAt = now();
}
