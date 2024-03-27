package io.openbas.schema;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.schema.model.PropertySchemaDTO;
import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@PreAuthorize("isAdmin()")
@RequestMapping
public class SchemaApi extends RestBehavior {

  @GetMapping("/api/schemas/{className}")
  public List<PropertySchemaDTO> schemas(
      @PathVariable @NotNull final String className,
      @RequestParam final boolean filterableOnly) throws ClassNotFoundException {
    String completeClassName = "io.openbas.database.model." + className;
    if (filterableOnly) {
      return SchemaUtils.schema(Class.forName(completeClassName))
          .stream()
          .filter(PropertySchema::isFilterable)
          .map(PropertySchemaDTO::new)
          .toList();
    }
    return SchemaUtils.schema(Class.forName(completeClassName))
        .stream()
        .map(PropertySchemaDTO::new)
        .toList();
  }

}
