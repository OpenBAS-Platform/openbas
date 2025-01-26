package io.openbas.rest.expectation;

import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
import io.openbas.service.ExerciseExpectationService;
import io.openbas.service.InjectExpectationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
public class ExpectationApi extends RestBehavior {

  public static final String API_EXPECTATIONS = "/api/expectations";
  public static final String API_INJECTS_EXPECTATIONS = "/api/injects/expectations";

  private final ExerciseExpectationService exerciseExpectationService;
  private final InjectExpectationService injectExpectationService;

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(API_EXPECTATIONS + "/{expectationId}")
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody final ExpectationUpdateInput input) {
    return exerciseExpectationService.updateInjectExpectation(expectationId, input);
  }

  @Transactional(rollbackOn = Exception.class)
  @DeleteMapping(API_EXPECTATIONS + "/{expectationId}/{sourceId}")
  public InjectExpectation deleteInjectExpectationResult(
      @PathVariable @NotBlank final String expectationId,
      @PathVariable @NotBlank final String sourceId) {
    return this.exerciseExpectationService.deleteInjectExpectationResult(expectationId, sourceId);
  }

  @GetMapping(API_INJECTS_EXPECTATIONS)
  public List<InjectExpectation> getInjectExpectationsNotFilled() {
    return Stream.concat(
            injectExpectationService.manualExpectationsNotFill().stream(),
            Stream.concat(
                injectExpectationService.preventionExpectationsNotFill().stream(),
                injectExpectationService.detectionExpectationsNotFill().stream()))
        .toList();
  }

  @GetMapping(API_INJECTS_EXPECTATIONS + "/{sourceId}")
  public List<InjectExpectation> getInjectExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return Stream.concat(
            injectExpectationService.manualExpectationsNotFill(sourceId).stream(),
            Stream.concat(
                injectExpectationService.preventionExpectationsNotFill(sourceId).stream(),
                injectExpectationService.detectionExpectationsNotFill(sourceId).stream()))
        .toList();
  }

  @Operation(
      summary = "Get Inject Expectations for a Specific Source",
      description =
          "Retrieves inject expectations of agents installed on an asset for a given source ID.")
  @GetMapping(API_INJECTS_EXPECTATIONS + "/assets/{sourceId}")
  public List<InjectExpectation> getInjectExpectationsAssetsNotFilledForSource(
      @PathVariable String sourceId) {
    return Stream.concat(
            injectExpectationService.preventionExpectationsNotFill(sourceId).stream(),
            injectExpectationService.detectionExpectationsNotFill(sourceId).stream())
        .toList();
  }

  @GetMapping(API_INJECTS_EXPECTATIONS + "/prevention")
  public List<InjectExpectation> getInjectPreventionExpectationsNotFilled() {
    return injectExpectationService.preventionExpectationsNotFill().stream().toList();
  }

  @Operation(
      summary = "Get Inject Expectations for a Specific Source and type Prevention",
      description =
          "Retrieves inject expectations of agents installed on an asset for a given source ID and type Prevention.")
  @GetMapping(API_INJECTS_EXPECTATIONS + "/prevention/{sourceId}")
  public List<InjectExpectation> getInjectPreventionExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return injectExpectationService.preventionExpectationsNotFill(sourceId).stream().toList();
  }

  @GetMapping(API_INJECTS_EXPECTATIONS + "/detection")
  public List<InjectExpectation> getInjectDetectionExpectationsNotFilled() {
    return injectExpectationService.detectionExpectationsNotFill().stream().toList();
  }

  @Operation(
      summary = "Get Inject Expectations for a Specific Source and type Detection",
      description =
          "Retrieves inject expectations of agents installed on an asset for a given source ID and type detection.")
  @GetMapping(API_INJECTS_EXPECTATIONS + "/detection/{sourceId}")
  public List<InjectExpectation> getInjectDetectionExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return injectExpectationService.detectionExpectationsNotFill(sourceId).stream().toList();
  }

  @PutMapping(API_INJECTS_EXPECTATIONS + "/{expectationId}")
  @Transactional(rollbackOn = Exception.class)
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody @NotNull InjectExpectationUpdateInput input) {
    return injectExpectationService.updateInjectExpectation(expectationId, input);
  }
}
