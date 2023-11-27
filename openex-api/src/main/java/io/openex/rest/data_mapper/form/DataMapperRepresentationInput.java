package io.openex.rest.data_mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Base;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class DataMapperRepresentationInput {

  @NotBlank
  @JsonProperty("data_mapper_representation_name")
  private String name;

  @NotNull
  @JsonProperty("data_mapper_representation_clazz")
  private Class<? extends Base> clazz;

  @JsonProperty("data_mapper_representation_properties")
  private List<DataMapperRepresentationPropertyInput> properties;

}
