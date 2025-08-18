package io.openbas.api.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.jsonapi.GenericJsonApiExporter;
import io.openbas.jsonapi.GenericJsonApiImporter;
import io.openbas.jsonapi.JsonApiDocument;
import io.openbas.jsonapi.ResourceObject;
import io.openbas.rest.custom_dashboard.CustomDashboardApi;
import io.openbas.rest.helper.RestBehavior;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(CustomDashboardApi.CUSTOM_DASHBOARDS_URI)
@RequiredArgsConstructor
@PreAuthorize("isAdmin()")
public class CustomDashboardApiImporter extends RestBehavior {

  private final GenericJsonApiImporter<CustomDashboard> importer;
  private final GenericJsonApiExporter exporter;

  @PostMapping(value = "/import")
  @Transactional
  public ResponseEntity<JsonApiDocument<ResourceObject>> importJson(
      @RequestBody @NotNull JsonApiDocument<ResourceObject> doc,
      @RequestParam(name = "include", required = false) Boolean include) {
    CustomDashboard persisted = importer.upsert(doc, include);

    JsonApiDocument<ResourceObject> export = exporter.export(persisted, include != null && include);

    return ResponseEntity.ok(export);
  }
}
