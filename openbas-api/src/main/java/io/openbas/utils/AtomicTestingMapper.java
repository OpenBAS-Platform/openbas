package io.openbas.utils;

import static io.openbas.database.model.InjectStatus.draftInjectStatus;
import static io.openbas.utils.AtomicTestingUtils.getRefinedExpectations;
import static io.openbas.utils.AtomicTestingUtils.getTargets;

import io.openbas.database.model.*;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.atomic_testing.form.InjectResultDTO.InjectResultDTOBuilder;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AtomicTestingMapper {

  public static InjectResultDTO toDtoWithTargetResults(Inject inject) {
    List<InjectTargetWithResult> targets = AtomicTestingUtils.getTargetsWithResults(inject);
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                getRefinedExpectations(inject, targetIds)))
        .build();
  }

  public static InjectResultDTO toDto(Inject inject) {
    List<InjectTargetWithResult> targets = getTargets(inject.getTeams(), inject.getAssets(), inject.getAssetGroups());
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

    return getAtomicTestingOutputBuilder(inject)
        .targets(targets)
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                getRefinedExpectations(inject, targetIds)))
        .build();
  }

  private static InjectResultDTOBuilder getAtomicTestingOutputBuilder(Inject inject) {
    return InjectResultDTO.builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .description(inject.getDescription())
        .content(inject.getContent())
        .expectations(inject.getExpectations())
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
        .status(inject.getStatus().orElse(draftInjectStatus()))
        .killChainPhases(inject.getKillChainPhases())
        .attackPatterns(inject.getAttackPatterns())
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
