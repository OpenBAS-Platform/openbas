package io.openbas.opencti;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.service.ScenarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import static io.openbas.database.model.User.ROLE_USER;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class OpenCTIApi {

  public static final String OPENCTI_URI = "/api/opencti/v1";

  private final ScenarioService scenarioService;

  @Operation(summary = "Retrieve the latest exercise by external reference ID (example: a report ID")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Found the exercise",
          content = {
              @Content(mediaType = "application/json", schema = @Schema(implementation = ExerciseSimple.class))
          }),
      @ApiResponse(responseCode = "404", description = "Exercise not found", content = @Content)
  })
  @LogExecutionTime
  @GetMapping(OPENCTI_URI + "/exercises/latest/{externalReferenceId}")
  public ExerciseSimple latestExerciseByExternalReference(@PathVariable @NotBlank final String externalReferenceId) {
    return scenarioService.latestExerciseByExternalReference(externalReferenceId);
  }

}
