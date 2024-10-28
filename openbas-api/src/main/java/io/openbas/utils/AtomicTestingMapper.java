package io.openbas.utils;

import static io.openbas.database.model.InjectStatus.draftInjectStatus;
import static io.openbas.utils.AtomicTestingUtils.getRefinedExpectations;

import io.openbas.database.model.*;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AtomicTestingMapper {

  private final ResultUtils resultUtils;

  public InjectResultDTO toInjectResultDTO(Inject inject) {
    List<InjectTargetWithResult> targets =
        resultUtils.getInjectTargetWithResults(Set.of(inject.getId()));
    List<String> targetIds = targets.stream().map(InjectTargetWithResult::getId).toList();

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
        .commandsLines(InjectUtils.getCommandsLinesFromInject(inject).orElse(null))
        .targets(targets)
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                getRefinedExpectations(inject, targetIds)))
        .updatedAt(inject.getUpdatedAt())
        .build();
  }

  public record ExpectationResultsByType(
      @NotNull ExpectationType type,
      @NotNull InjectExpectation.EXPECTATION_STATUS avgResult,
      @NotNull List<ResultDistribution> distribution) {}

  public record ResultDistribution(
      @NotNull String id, @NotNull String label, @NotNull Integer value) {}
}
