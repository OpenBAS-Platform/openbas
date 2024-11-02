package io.openbas.rest.migration;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.MigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Log
@RestController
@Secured("ROLE_ADMIN")
@RequestMapping(MigrationApi.MIGRATION_URI)
@RequiredArgsConstructor
public class MigrationApi extends RestBehavior {

  public static final String MIGRATION_URI = "/api/migrations";

  private final MigrationService migrationService;

  @PostMapping("/synchronize-expectations")
  @LogExecutionTime
  public ResponseEntity<String> processExpectations() {
    migrationService.processExpectations();
    return ResponseEntity.ok("Migration completed successfully.");
  }
}
