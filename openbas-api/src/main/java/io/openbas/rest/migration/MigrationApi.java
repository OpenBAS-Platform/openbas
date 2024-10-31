package io.openbas.rest.migration;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.helper.RestBehavior;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.beanutils.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Log
@RestController
@RequestMapping(MigrationApi.MIGRATION_URI)
@RequiredArgsConstructor
public class MigrationApi extends RestBehavior {

  public static final String MIGRATION_URI = "/api/migrations";

  private final InjectExpectationRepository injectExpectationRepository;

  @Secured("ROLE_ADMIN")
  @PostMapping("/process-expectations")
  @Operation(summary = "Process Expectations", description = "Process expectations in order to be compatible with currently system of team and player expectations")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Migration completed successfully."),
      @ApiResponse(responseCode = "500", description = "Migration failed due to server error.")
  })
  @LogExecutionTime
  public ResponseEntity<String> processExpectations() {
    log.info("Process expectations started.");

    try {
      Set<RawInjectExpectation> rawInjectExpectations = injectExpectationRepository.rawAll();
      log.info("Fetched " + rawInjectExpectations.size() + " raw expectations.");

      Map<String, List<RawInjectExpectation>> groupedExpectations = rawInjectExpectations.stream()
          .filter(e -> e.getTeam_id() != null)
          .collect(Collectors.groupingBy(e ->
              e.getInject_id() + "|" + e.getTeam_id() + "|" + e.getInject_expectation_type()
          ));

      log.info("Grouped expectations into " + groupedExpectations.size() + " groups.");

      List<InjectExpectation> expectationsToCreate = new ArrayList<>();
      processGroupedExpectations(groupedExpectations, expectationsToCreate);

      log.info("Saving " + expectationsToCreate.size() + " expectations to the repository.");
      injectExpectationRepository.saveAll(expectationsToCreate);
      log.info("Successfully saved expectations.");

      return ResponseEntity.ok("Migration completed successfully.");
    } catch (Exception e) {
      log.severe("Error during migration: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Migration failed: " + e.getMessage());
    }
  }

  private void processGroupedExpectations(Map<String, List<RawInjectExpectation>> groupedExpectations, List<InjectExpectation> expectationsToCreate) {
    for (Map.Entry<String, List<RawInjectExpectation>> entry : groupedExpectations.entrySet()) {
      String groupKey = entry.getKey();
      List<RawInjectExpectation> expectationList = entry.getValue();

      log.fine("Processing group: " + groupKey);
      log.fine("Expectations in this group: " + expectationList.size());

      boolean requireTeamExpectation = expectationList.stream()
          .noneMatch(e -> e.getUser_id() == null);
      boolean requireUserExpectation = expectationList.stream()
          .noneMatch(e -> e.getUser_id() != null);

      if (requireTeamExpectation) {
        log.info("Creating team expectation for group: " + groupKey);
        InjectExpectation newInjectExpectation = new InjectExpectation();
        BeanUtils.copyProperties(newInjectExpectation, expectationList.stream().findAny().orElse(null));
        newInjectExpectation.setUser(null);
        expectationsToCreate.add(newInjectExpectation);
      }
      if (requireUserExpectation) {
        log.info("Creating user expectation for group: " + groupKey);
        InjectExpectation newInjectExpectation = new InjectExpectation();
        BeanUtils.copyProperties(newInjectExpectation, expectationList.stream().findAny().orElse(null));
        expectationsToCreate.add(newInjectExpectation);
      }
    }
  }
}
