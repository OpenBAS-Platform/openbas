package io.openbas.rest.expectation;

import io.openbas.database.model.Collector;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.CollectorRepository;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
import io.openbas.service.ExerciseExpectationService;
import io.openbas.service.InjectExpectationService;
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

  private final ExerciseExpectationService exerciseExpectationService;
  private final InjectExpectationService injectExpectationService;
  private final CollectorRepository collectorRepository;

  @Transactional(rollbackOn = Exception.class)
  @PutMapping("/api/expectations/{expectationId}")
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody final ExpectationUpdateInput input) {
    return this.exerciseExpectationService.updateInjectExpectation(expectationId, input);
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping("/api/expectations/{expectationId}/{sourceId}/delete")
  public InjectExpectation deleteInjectExpectationResult(
      @PathVariable @NotBlank final String expectationId,
      @PathVariable @NotBlank final String sourceId) {
    return this.exerciseExpectationService.deleteInjectExpectationResult(expectationId, sourceId);
  }

  @GetMapping("/api/injects/expectations")
  public List<InjectExpectation> getInjectExpectationsNotFilled() {
    return Stream.concat(
            injectExpectationService.manualExpectationsNotFill().stream(),
            Stream.concat(
                injectExpectationService.preventionExpectationsNotFill().stream(),
                injectExpectationService.detectionExpectationsNotFill().stream()))
        .toList();
  }

  @GetMapping("/api/injects/expectations/{sourceId}")
  public List<InjectExpectation> getInjectExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return Stream.concat(
            injectExpectationService.manualExpectationsNotFill(sourceId).stream(),
            Stream.concat(
                injectExpectationService.preventionExpectationsNotFill(sourceId).stream(),
                injectExpectationService.detectionExpectationsNotFill(sourceId).stream()))
        .toList();
  }

  @GetMapping("/api/injects/expectations/assets/{sourceId}")
  public List<InjectExpectation> getInjectExpectationsAssetsNotFilledForSource(
      @PathVariable String sourceId) {
    return Stream.concat(
            injectExpectationService.preventionExpectationsNotFill(sourceId).stream(),
            injectExpectationService.detectionExpectationsNotFill(sourceId).stream())
        .toList();
  }

  @GetMapping("/api/injects/expectations/prevention")
  public List<InjectExpectation> getInjectPreventionExpectationsNotFilled() {
    return injectExpectationService.preventionExpectationsNotFill().stream().toList();
  }

  @GetMapping("/api/injects/expectations/prevention/{sourceId}")
  public List<InjectExpectation> getInjectPreventionExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return injectExpectationService.preventionExpectationsNotFill(sourceId).stream().toList();
  }

  @GetMapping("/api/injects/expectations/detection")
  public List<InjectExpectation> getInjectDetectionExpectationsNotFilled() {
    return injectExpectationService.detectionExpectationsNotFill().stream().toList();
  }

  @GetMapping("/api/injects/expectations/detection/{sourceId}")
  public List<InjectExpectation> getInjectDetectionExpectationsNotFilledForSource(
      @PathVariable String sourceId) {
    return injectExpectationService.detectionExpectationsNotFill(sourceId).stream().toList();
  }

  @PutMapping("/api/injects/expectations/{expectationId}")
  @Transactional(rollbackOn = Exception.class)
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody @NotNull InjectExpectationUpdateInput input) {
    InjectExpectation injectExpectation =
        this.injectExpectationService.findInjectExpectation(expectationId).orElseThrow();
    Collector collector = this.collectorRepository.findById(input.getCollectorId()).orElseThrow();
    injectExpectation =
        this.injectExpectationService.computeExpectation(
            injectExpectation,
            collector.getId(),
            "collector",
            collector.getName(),
            input.getResult(),
            input.getIsSuccess(),
            input.getMetadata());

    Inject inject = injectExpectation.getInject();

    // Compute potential expectations for asset
    List<InjectExpectation> expectationAssets =
        inject.getExpectations().stream()
            .filter(e -> e.getAsset() != null && e.getAgent() == null)
            .toList();
    expectationAssets.forEach(
        (expectationAsset -> {
          List<InjectExpectation> expectationAgents =
              this.injectExpectationService.expectationsForAgents(
                  expectationAsset.getInject(),
                  expectationAsset.getAsset(),
                  expectationAsset.getType());
          // Every expectation assets are filled
          if (expectationAgents.stream().noneMatch(e -> e.getResults().isEmpty())) {
            this.injectExpectationService.computeExpectationGroup(
                expectationAsset,
                expectationAgents,
                collector.getId(),
                "collector",
                collector.getName());
          }
        }));

    // Compute potential expectations for asset groups
    List<InjectExpectation> expectationAssetGroups =
        inject.getExpectations().stream().filter(e -> e.getAssetGroup() != null).toList();
    expectationAssetGroups.forEach(
        (expectationAssetGroup -> {
          List<InjectExpectation> expectationAssetsByAssetGroup =
              this.injectExpectationService.expectationsForAssets(
                  expectationAssetGroup.getInject(),
                  expectationAssetGroup.getAssetGroup(),
                  expectationAssetGroup.getType());
          // Every expectation assets are filled
          if (expectationAssetsByAssetGroup.stream().noneMatch(e -> e.getResults().isEmpty())) {
            this.injectExpectationService.computeExpectationGroup(
                expectationAssetGroup,
                expectationAssetsByAssetGroup,
                collector.getId(),
                "collector",
                collector.getName());
          }
        }));
    // end of computing

    return injectExpectation;
  }
}
