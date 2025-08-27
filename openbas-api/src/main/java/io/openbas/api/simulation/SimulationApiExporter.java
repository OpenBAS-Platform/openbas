package io.openbas.api.simulation;

import io.openbas.database.model.Exercise;
import io.openbas.jsonapi.IncludeOptions;
import io.openbas.jsonapi.ZipJsonApi;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.simulation.SimulationApi;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(SimulationApi.SIMULATION_URI)
@RequiredArgsConstructor
@PreAuthorize("isAdmin()")
public class SimulationApiExporter extends RestBehavior {

  private final ExerciseService exerciseService;
  private final ZipJsonApi<Exercise> zipJsonApi;

  @Operation(
      description =
          "Exports a simulation in JSON:API format, optionally including related entities.")
  @GetMapping(value = "/{simulationId}/export", produces = "application/zip")
  @Transactional(readOnly = true)
  public ResponseEntity<byte[]> export(
      @PathVariable @NotBlank final String simulationId,
      @RequestParam(required = false) final Boolean isWithTeams,
      @RequestParam(required = false) final Boolean isWithPlayers,
      @RequestParam(required = false) final Boolean isWithVariableValues)
      throws IOException {
    Exercise simulation = exerciseService.exercise(simulationId);
    IncludeOptions includeOptions =
        IncludeOptions.of(
            Map.of(
                "isWithTeams",
                isWithTeams,
                "isWithPlayers",
                isWithPlayers,
                "isWithVariableValues",
                isWithVariableValues));
    return zipJsonApi.handleExport(simulation, null, includeOptions);
  }
}
