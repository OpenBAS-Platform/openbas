package io.openbas.schema;

import static io.openbas.utils.schema.SchemaUtils.isValidClassName;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.schema.model.PropertySchemaDTO;
import io.openbas.utils.schema.SchemaUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping
public class SchemaApi extends RestBehavior {

  @PostMapping("/api/schemas/{className}")
  public List<PropertySchemaDTO> schemas(
      @PathVariable @NotNull final String className,
      @RequestParam final boolean filterableOnly,
      @RequestBody @Valid @NotNull List<String> filterNames)
      throws ClassNotFoundException {

    final String basePackage = "io.openbas.database.model";

    if (!isValidClassName(className)) {
      throw new IllegalArgumentException("Class not allowed : " + className);
    }
    String completeClassName = basePackage + "." + className;

    Class<?> clazz = Class.forName(completeClassName);

    return SchemaUtils.schemaWithSubtypes(clazz).stream()
        .filter(p -> !filterableOnly || p.isFilterable())
        .filter(p -> filterNames.isEmpty() || filterNames.contains(p.getJsonName()))
        .map(PropertySchemaDTO::new)
        .toList();
  }
}
