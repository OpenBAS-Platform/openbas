package io.openbas.api.custom_dashboard;

import io.openbas.database.model.CustomDashboard;
import io.openbas.jsonapi.*;
import io.openbas.rest.custom_dashboard.CustomDashboardApi;
import io.openbas.rest.helper.RestBehavior;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(CustomDashboardApi.CUSTOM_DASHBOARDS_URI)
@RequiredArgsConstructor
@PreAuthorize("isAdmin()")
public class CustomDashboardApiImporter extends RestBehavior {

  private final ZipJsonApi<CustomDashboard> zipJsonApi;

  @Operation(
      description =
          "Imports a custom dashboard from a JSON:API document. The name will be suffixed with '(import)' by default.")
  @PostMapping(
      value = "/import",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Transactional
  public ResponseEntity<JsonApiDocument<ResourceObject>> importJson(
      @RequestPart("file") @NotNull MultipartFile file,
      @RequestParam(name = "include", required = false) Boolean include)
      throws IOException {
    return zipJsonApi.handleImport(file, "custom_dashboard_name", include != null && include);
  }
}
