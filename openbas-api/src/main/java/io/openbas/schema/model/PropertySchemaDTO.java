package io.openbas.schema.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.utils.schema.PropertySchema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
public class PropertySchemaDTO {

  @NotBlank
  @JsonProperty("schema_property_name")
  private String jsonName;

  @NotNull
  @JsonProperty("schema_property_type")
  private String type;

  @JsonProperty("schema_property_type_array")
  private boolean isArray;
  @JsonProperty("schema_property_values")
  private List<String> values;
  @JsonProperty("schema_property_has_dynamic_value")
  private boolean dynamicValues;

  public PropertySchemaDTO(@NotNull final PropertySchema propertySchema) {
    this.setJsonName(propertySchema.getJsonName());
    this.setArray(propertySchema.getType().isArray() || Collection.class.isAssignableFrom(propertySchema.getType()));
    this.setValues(propertySchema.getAvailableValues());
    this.setDynamicValues(propertySchema.isDynamicValues());
    this.setType(propertySchema.getType().getSimpleName().toLowerCase());
  }

}
