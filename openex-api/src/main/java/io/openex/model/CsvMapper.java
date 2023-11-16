package io.openex.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Singular;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Builder
@Data
public class CsvMapper { // TODO: migrate to model if we need to manage it

  @Getter
  public enum SEPARATOR {
    COMMA(","),
    SEMICOLON(";");

    private final String value;

    SEPARATOR(@NotNull final String value) {
      this.value = value;
    }
  }

  @NotBlank
  @JsonProperty("csv_mapper_name")
  private String name;

  @JsonProperty("csv_mapper_has_header")
  private boolean hasHeader;

  @NotBlank
  @JsonProperty("csv_mapper_separator")
  private SEPARATOR separator;

  @Singular
  @JsonProperty("csv_mapper_representations")
  private List<CsvMapperRepresentation> representations;

}
