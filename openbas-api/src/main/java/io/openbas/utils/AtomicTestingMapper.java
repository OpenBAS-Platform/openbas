package io.openbas.utils;

import static io.openbas.utils.AtomicTestingUtils.getRefinedExpectations;
import static io.openbas.utils.AtomicTestingUtils.getTargets;

import io.openbas.database.model.*;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectResultOutput;
import io.openbas.rest.atomic_testing.form.InjectStatusSimple;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;

public class AtomicTestingMapper {

  public static InjectResultOutput toDtoWithTargetResults(Inject inject) {
    List<InjectTargetWithResult> targets = AtomicTestingUtils.getTargetsWithResults(inject);
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                getRefinedExpectations(inject, targetIds)))
        .build();
  }

  public static InjectResultOutput toDto(Inject inject) {
    List<InjectTargetWithResult> targets =
        getTargets(inject.getTeams(), inject.getAssets(), inject.getAssetGroups());
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                getRefinedExpectations(inject, targetIds)))
        .build();
  }

  private static InjectResultOutput.InjectResultOutputBuilder getAtomicTestingOutputBuilder(
      Inject inject) {
    return InjectResultOutput.builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .description(inject.getDescription())
        .content(inject.getContent())
        .expectations(Collections.emptyList())
        .type(
            inject
                .getInjectorContract()
                .map(injectorContract -> injectorContract.getInjector().getType())
                .orElse(null))
        .tagIds(inject.getTags().stream().map(Tag::getId).toList())
        .documents(
            inject.getDocuments().stream()
                .map(InjectDocument::getDocument)
                .map(Document::getId)
                .toList())
        .injectorContract(inject.getInjectorContract().orElse(null))
        .status(InjectStatusSimple.builder().build())
        .killChainPhases(Collections.emptyList())
        .attackPatterns(Collections.emptyList())
        .isReady(inject.isReady())
        .updatedAt(inject.getUpdatedAt());
  }

  public record ExpectationResultsByType(
      @NotNull ExpectationType type,
      @NotNull InjectExpectation.EXPECTATION_STATUS avgResult,
      @NotNull List<ResultDistribution> distribution) {}

  public record ResultDistribution(
      @NotNull String id, @NotNull String label, @NotNull Integer value) {}
}
