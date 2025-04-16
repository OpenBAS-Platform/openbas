package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import io.swagger.v3.oas.annotations.media.DiscriminatorMapping;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Set;
import lombok.Data;

@Data
@Schema(
    discriminatorProperty = "target_type",
    oneOf = {
      AssetGroupTarget.class,
    },
    discriminatorMapping = {
      @DiscriminatorMapping(value = "ASSETS_GROUPS", schema = AssetGroupTarget.class),
    })
public class InjectTarget {
  @JsonProperty("target_id")
  private String id;

  @JsonProperty("target_name")
  @Queryable(filterable = true, searchable = true, sortable = true)
  private String name;

  @JsonProperty("target_tags")
  @Queryable(filterable = true, searchable = true, sortable = true)
  private Set<String> tags;

  @JsonProperty("target_type")
  private String targetType;

  @JsonProperty("target_detection_status")
  private InjectExpectation.EXPECTATION_STATUS getTargetDetectionStatus() {
    return InjectExpectation.EXPECTATION_STATUS.UNKNOWN;
  }

  @JsonProperty("target_prevention_status")
  private InjectExpectation.EXPECTATION_STATUS getTargetPreventionStatus() {
    return InjectExpectation.EXPECTATION_STATUS.UNKNOWN;
  }

  @JsonProperty("target_human_response_status")
  private InjectExpectation.EXPECTATION_STATUS getTargetHumanResponseStatus() {
    return InjectExpectation.EXPECTATION_STATUS.UNKNOWN;
  }

  @JsonProperty("target_execution_status")
  private InjectExpectation.EXPECTATION_STATUS getTargetExecutionStatus() {
    return InjectExpectation.EXPECTATION_STATUS.UNKNOWN;
  }
}
