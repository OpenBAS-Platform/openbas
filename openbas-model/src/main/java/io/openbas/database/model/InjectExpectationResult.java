package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
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

  private Map<String, String> metadata;
}
