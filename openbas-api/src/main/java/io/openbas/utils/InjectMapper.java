package io.openbas.utils;

import io.openbas.atomic_testing.TargetType;
import io.openbas.database.model.Document;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.Tag;
import io.openbas.rest.atomic_testing.form.InjectResultOverviewOutput;
import io.openbas.rest.atomic_testing.form.InjectStatusSimple;
import io.openbas.rest.atomic_testing.form.TargetSimple;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectMapper {

  private final InjectUtils injectUtils;
  private final ResultUtils resultUtils;

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
        .expectations(null)
        .killChainPhases(Collections.emptyList())
        .attackPatterns(Collections.emptyList())
        .isReady(inject.isReady())
        .updatedAt(inject.getUpdatedAt())
        .expectationResultByTypes(resultUtils.getResultsByTypes(Set.of(inject.getId())))
        .targets(resultUtils.getInjectTargetWithResults(Set.of(inject.getId())))
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
}
