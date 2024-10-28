package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InjectExpectationResult {

  private String sourceId;

  private String sourceType;

  private String sourceName;

  private String date;

  private Double score;

  @NotBlank private String result;
}
