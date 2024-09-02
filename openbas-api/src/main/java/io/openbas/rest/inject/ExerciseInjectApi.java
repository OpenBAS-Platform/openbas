package io.openbas.rest.inject;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTestStatus;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.service.InjectService;
import io.openbas.service.InjectTestStatusService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.database.specification.InjectSpecification.fromExercise;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

@RestController
@RequiredArgsConstructor
public class ExerciseInjectApi extends RestBehavior {

  private final InjectService injectService;

  private final InjectTestStatusService injectTestStatusService;

  @Operation(summary = "Retrieved injects for an exercise")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "200", description = "Retrieved injects for an exercise",
          content = {
              @Content(mediaType = "application/json", schema = @Schema(implementation = InjectOutput.class))
          }
      ),
  })
  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/simple")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> exerciseInjectsSimple(@PathVariable @NotBlank final String exerciseId) {
    return injectService.injects(fromExercise(exerciseId));
  }

  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects/simple")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> exerciseInjectsSimple(
      @PathVariable @NotBlank final String exerciseId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationCriteriaBuilder(
        (Specification<Inject> specification, Pageable pageable) -> this.injectService.injects(
            fromExercise(exerciseId).and(specification), pageable
        ),
        searchPaginationInput,
        Inject.class
    );
  }

  @DeleteMapping(EXERCISE_URI + "/{exerciseId}/injects")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteListOfInjectsForExercise(@PathVariable final String exerciseId,
      @RequestBody List<String> injectIds) {
    injectService.deleteAllByIds(injectIds);
  }

  @PostMapping("/api/exercise/{exerciseId}/injects/test")
  public Page<InjectTestStatus> findAllExerciseInjectTests(@PathVariable @NotBlank String exerciseId,
      @RequestBody @Valid
      SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByExerciseId(exerciseId, searchPaginationInput);
  }

}
