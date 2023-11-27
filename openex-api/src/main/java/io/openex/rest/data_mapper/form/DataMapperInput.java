package io.openex.rest.data_mapper.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.DataMapper;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class DataMapperInput {

  @NotBlank
  @JsonProperty("data_mapper_name")
  private String name;

  @JsonProperty("data_mapper_has_header")
  private boolean hasHeader;

  @NotNull
  @JsonProperty("data_mapper_separator")
  private DataMapper.SEPARATOR separator;

  @JsonProperty("data_mapper_representations")
  private List<DataMapperRepresentationInput> representations;

}
