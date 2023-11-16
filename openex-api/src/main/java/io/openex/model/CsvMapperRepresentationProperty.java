package io.openex.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@AllArgsConstructor
@Data
public class CsvMapperRepresentationProperty {

  @NotBlank
  @JsonProperty("representation_property_name")
  private String propertyName;

  @NotBlank
  @JsonProperty("representation_column_name")
  private String columnName;

}
