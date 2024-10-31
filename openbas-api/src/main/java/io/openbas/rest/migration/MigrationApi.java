package io.openbas.rest.migration;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.MigrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Log
@RestController
@RequestMapping(MigrationApi.MIGRATION_URI)
@RequiredArgsConstructor
public class MigrationApi extends RestBehavior {

  public static final String MIGRATION_URI = "/api/migrations";

  private final MigrationService migrationService;

  @Secured("ROLE_ADMIN")
  @PostMapping("/process-expectations")
  @Operation(
      summary = "Process Expectations",
      description =
          "Process expectations in order to be compatible with currently system of team and player expectations")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Migration completed successfully."),
        @ApiResponse(responseCode = "500", description = "Migration failed due to server error.")
      })
  @LogExecutionTime
  public ResponseEntity<String> processExpectations() {
    try {
      migrationService.processExpectations();
      return ResponseEntity.ok("Migration completed successfully.");
    } catch (Exception e) {
      log.severe("Error during migration: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Migration failed: " + e.getMessage());
    }
  }
}
