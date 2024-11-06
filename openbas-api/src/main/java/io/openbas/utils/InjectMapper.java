package io.openbas.utils;

import static io.openbas.utils.AtomicTestingUtils.getRefinedExpectations;

import io.openbas.database.model.*;
import io.openbas.database.raw.RawTarget;
import io.openbas.database.raw.TargetType;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectResultOverviewOutput;
import io.openbas.rest.atomic_testing.form.InjectStatusSimple;
import io.openbas.rest.atomic_testing.form.TargetSimple;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectMapper {

  private final InjectUtils injectUtils;

  public InjectResultOverviewOutput toDto(Inject inject) {
    return InjectResultOverviewOutput.builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .description(inject.getDescription())
        .content(inject.getContent())
        .commandsLines(injectUtils.getCommandsLinesFromInject(inject))
        .type(
            inject
                .getInjectorContract()
                .map(injectorContract -> injectorContract.getInjector().getType())
                .orElse(null))
        .tagIds(inject.getTags().stream().map(Tag::getId).toList())
        .documentIds(
            inject.getDocuments().stream()
                .map(InjectDocument::getDocument)
                .map(Document::getId)
                .toList())
        .injectorContract(null)
        .status(InjectStatusSimple.builder().build())
        .killChainPhases(Collections.emptyList())
        .attackPatterns(Collections.emptyList())
        .isReady(inject.isReady())
        .updatedAt(inject.getUpdatedAt())
        .expectationResultByTypes(
            AtomicTestingUtils.getExpectationResultByTypes(
                getRefinedExpectations(
                    inject, inject.getTeams().stream().map(t -> t.getId()).toList())))
        // todo all targets
        .build();
  }

  // -- TEAMS, ASSETS, ASSETGROUPS to TARGET --
  public List<TargetSimple> toTargetSimple(List<RawTarget> rawTargets) {
    return rawTargets.stream().map(rawTarget -> toTargetSimple(rawTarget)).toList();
  }

  public TargetSimple toTargetSimple(RawTarget rawTarget) {
    return TargetSimple.builder()
        .id(rawTarget.getId())
        .name(rawTarget.getName())
        .type(rawTarget.getType())
        .build();
  }

  // -- OBJECT[] to TARGET --
  public List<TargetSimple> toTargetSimple(List<Object[]> targets, TargetType type) {
    return targets.stream().map(target -> toTargetSimple(target, type)).toList();
  }

  public TargetSimple toTargetSimple(Object[] target, TargetType type) {
    return TargetSimple.builder()
        .id((String) target[1])
        .name((String) target[2])
        .type(type)
        .build();
  }

  // -- RECORDS --

  public record ExpectationResultsByType(
      @NotNull ExpectationType type,
      @NotNull InjectExpectation.EXPECTATION_STATUS avgResult,
      @NotNull List<ResultDistribution> distribution) {}

  public record ResultDistribution(
      @NotNull String id, @NotNull String label, @NotNull Integer value) {}
}
