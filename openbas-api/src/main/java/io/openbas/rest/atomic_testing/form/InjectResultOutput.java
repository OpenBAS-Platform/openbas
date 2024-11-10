package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InjectResultOutput {

  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @JsonProperty("inject_title")
  @NotBlank
  private String title;

  @JsonProperty("inject_updated_at")
  @NotNull
  private Instant updatedAt;

  @JsonProperty("inject_type")
  public String injectType;

  @JsonProperty("inject_injector_contract")
  private InjectorContractSimple injectorContract;

  @JsonProperty("inject_status")
  private InjectStatusSimple status;

  @JsonIgnore private String[] teamIds;
  @JsonIgnore private String[] assetIds;
  @JsonIgnore private String[] assetGroupIds;

  // -- PROCESSED ATTRIBUTES --

  @JsonProperty("inject_targets")
  private List<TargetSimple> targets = new ArrayList<>();

  @JsonProperty("inject_expectation_results")
  private List<ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();
}
