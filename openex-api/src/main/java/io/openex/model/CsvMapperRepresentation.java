package io.openex.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Base;
import lombok.Builder;
import lombok.Data;
import lombok.Singular;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Builder
@Data
public class CsvMapperRepresentation {

  @NotBlank
  @JsonProperty("representation_id")
  private String id;

  @NotNull
  @JsonProperty("representation_clazz")
  private Class<? extends RepositoryClass<? extends Base>> clazz;

  @JsonProperty("representation_properties")
  @Singular
  private List<CsvMapperRepresentationProperty> properties;

}
