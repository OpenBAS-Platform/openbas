package io.openbas.collectors.sentinel.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openbas.collectors.sentinel.utils.InstantUtils;
import lombok.Data;
import lombok.Getter;

import java.time.Instant;

import static lombok.AccessLevel.NONE;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IncidentProperties {

  private String title;
  private String providerName;
  private String providerIncidentId;
  private String severity;
  private String incidentUrl;
  @Getter(NONE)
  private String createdTimeUtc;
  @Getter(NONE)
  private String lastModifiedTimeUtc;

  public Instant getCreatedTimeUtc() {
    return InstantUtils.toInstant(this.createdTimeUtc);
  }

  public Instant getLastModifiedTimeUtc() {
    return InstantUtils.toInstant(this.lastModifiedTimeUtc);
  }
}
