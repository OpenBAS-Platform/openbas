package io.openbas.api.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.jsonapi.GenericJsonApiExporter;
import io.openbas.jsonapi.JsonApiDocument;
import io.openbas.jsonapi.ResourceObject;
import io.openbas.rest.custom_dashboard.CustomDashboardApi;
import io.openbas.rest.custom_dashboard.CustomDashboardService;
import io.openbas.rest.helper.RestBehavior;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(CustomDashboardApi.CUSTOM_DASHBOARDS_URI)
@RequiredArgsConstructor
@PreAuthorize("isAdmin()")
public class CustomDashboardApiExporter extends RestBehavior {

  private final CustomDashboardService customDashboardService;
  private final GenericJsonApiExporter exporter;

  @Operation(
      description =
          "Exports a custom dashboard in JSON:API format, optionally including related entities.")
  @GetMapping(value = "/{customDashboardId}/export")
  @Transactional(readOnly = true)
  public ResponseEntity<JsonApiDocument<ResourceObject>> export(
      @PathVariable @NotBlank final String customDashboardId,
      @RequestParam(name = "include", required = false) Boolean include) {
    CustomDashboard customDashboard =
        this.customDashboardService.customDashboard(customDashboardId);
    JsonApiDocument<ResourceObject> resource =
        exporter.export(customDashboard, include != null && include);
    return ResponseEntity.ok(resource);
  }
}
