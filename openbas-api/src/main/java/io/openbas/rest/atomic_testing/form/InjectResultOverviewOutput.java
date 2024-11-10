package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.InjectStatusCommandLine;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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
public class InjectResultOverviewOutput {

  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @JsonProperty("inject_title")
  @NotBlank
  private String title;

  @JsonProperty("inject_description")
  private String description;

  @JsonProperty("inject_content")
  private ObjectNode content;

  @JsonProperty("inject_commands_lines")
  private InjectStatusCommandLine commandsLines;

  @JsonProperty("inject_type")
  private String type;

  @JsonProperty("injects_tags")
  private List<String> tagIds;

  @JsonProperty("injects_documents")
  private List<String> documentIds;

  @Schema(description = "Full contract")
  @JsonProperty("inject_injector_contract")
  @NotNull
  private InjectorContractSimple injectorContract;

  @JsonProperty("inject_status")
  private InjectStatusOutput status;

  @JsonProperty("inject_expectations")
  private List<InjectExpectationSimple> expectations;

  @JsonProperty("inject_kill_chain_phases")
  private List<KillChainPhaseSimple> killChainPhases;

  @JsonProperty("inject_attack_patterns")
  private List<AttackPatternSimple> attackPatterns;

  @JsonProperty("inject_ready")
  private Boolean isReady;

  @JsonProperty("inject_updated_at")
  private Instant updatedAt;

  // -- PROCESSED ATTRIBUTES --

  @Default
  @Schema(description = "Result of expectations")
  @JsonProperty("inject_expectation_results")
  @NotNull
  private List<ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  @JsonProperty("inject_targets")
  @NotNull
  private List<InjectTargetWithResult> targets;
}
