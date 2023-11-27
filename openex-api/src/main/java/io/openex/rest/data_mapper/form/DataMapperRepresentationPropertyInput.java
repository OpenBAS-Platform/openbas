package io.openex.rest.data_mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class DataMapperRepresentationPropertyInput {

  @NotBlank
  @JsonProperty("data_mapper_representation_property_name")
  private String propertyName;

  @JsonProperty("data_mapper_representation_property_column_name")
  private String columnName;

}
