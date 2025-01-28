package io.openbas.rest.expectation;

import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
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

  public static final String EXPECTATIONS_URI = "/api/expectations";
  public static final String INJECTS_EXPECTATIONS_URI = "/api/injects/expectations";

  private final InjectExpectationService injectExpectationService;

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(EXPECTATIONS_URI + "/{expectationId}")
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody final ExpectationUpdateInput input) {
    return injectExpectationService.updateInjectExpectation(expectationId, input);
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(EXPECTATIONS_URI + "/{expectationId}/{sourceId}/delete")
  public InjectExpectation deleteInjectExpectationResult(
      @PathVariable @NotBlank final String expectationId,
      @PathVariable @NotBlank final String sourceId) {
    return injectExpectationService.deleteInjectExpectationResult(expectationId, sourceId);
  }

  @GetMapping(INJECTS_EXPECTATIONS_URI)
  public List<InjectExpectation> getInjectExpectationsNotFilled() {
    return Stream.concat(
            injectExpectationService.manualExpectationsNotFill().stream(),
            Stream.concat(
                injectExpectationService.preventionExpectationsNotFill().stream(),
                injectExpectationService.detectionExpectationsNotFill().stream()))
        .toList();
  }

  @GetMapping(INJECTS_EXPECTATIONS_URI + "/{sourceId}")
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
  @GetMapping(INJECTS_EXPECTATIONS_URI + "/assets/{sourceId}")
  public List<InjectExpectation> getInjectExpectationsAssetsNotFilledForSource(
      @PathVariable String sourceId) {
    return Stream.concat(
            injectExpectationService.preventionExpectationsNotFill(sourceId).stream(),
            injectExpectationService.detectionExpectationsNotFill(sourceId).stream())
        .toList();
  }

  @GetMapping(INJECTS_EXPECTATIONS_URI + "/prevention")
  public List<InjectExpectation> getInjectPreventionExpectationsNotFilled() {
    return injectExpectationService.preventionExpectationsNotFill().stream().toList();
  }

  @Operation(
      summary = "Get Inject Expectations for a Specific Source and type Prevention",
      description =
          "Retrieves inject expectations of agents installed on an asset for a given source ID and type Prevention.")
  @GetMapping(INJECTS_EXPECTATIONS_URI + "/prevention/{sourceId}")
  public List<InjectExpectation> getInjectPreventionExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return injectExpectationService.preventionExpectationsNotFill(sourceId).stream().toList();
  }

  @GetMapping(INJECTS_EXPECTATIONS_URI + "/detection")
  public List<InjectExpectation> getInjectDetectionExpectationsNotFilled() {
    return injectExpectationService.detectionExpectationsNotFill().stream().toList();
  }

  @Operation(
      summary = "Get Inject Expectations for a Specific Source and type Detection",
      description =
          "Retrieves inject expectations of agents installed on an asset for a given source ID and type detection.")
  @GetMapping(INJECTS_EXPECTATIONS_URI + "/detection/{sourceId}")
  public List<InjectExpectation> getInjectDetectionExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return injectExpectationService.detectionExpectationsNotFill(sourceId).stream().toList();
  }

  @Operation(
      summary = "Update Inject Expectation",
      description = "Update Inject expectation from an external source, e.g., EDR collector.")
  @PutMapping(INJECTS_EXPECTATIONS_URI + "/{expectationId}")
  @Transactional(rollbackOn = Exception.class)
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody @NotNull InjectExpectationUpdateInput input) {
    return injectExpectationService.updateInjectExpectation(expectationId, input);
  }
}
