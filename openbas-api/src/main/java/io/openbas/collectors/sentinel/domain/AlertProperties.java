package io.openbas.collectors.sentinel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

import static io.openbas.collectors.sentinel.utils.InstantUtils.toInstant;
import static lombok.AccessLevel.NONE;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlertProperties {

  private List<String> tactics;
  private String alertDisplayName;
  private String description;
  private List<String> remediationSteps;
  private String severity;
  private String alertType;
  @Getter(NONE)
  private String startTimeUtc;
  @Getter(NONE)
  private String endTimeUtc;
  private String friendlyName;

  public Instant getStartTimeUtc() {
    return toInstant(this.startTimeUtc);
  }

  public Instant getEndTimeUtc() {
    return toInstant(this.endTimeUtc);
  }
}
