package io.openbas.utils.mapper;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InjectExpectationMapper {

  private final InjectMapper injectMapper;

  public InjectExpectationResultsByAttackPattern toInjectExpectationResultsByattackPattern(
      final AttackPattern attackPattern, @NotNull final List<Inject> injects) {

    return InjectExpectationResultsByAttackPattern.builder()
        .results(
            injects.stream()
                .map(
                    inject -> {
                      InjectExpectationResultsByAttackPattern.InjectExpectationResultsByType
                          result =
                              new InjectExpectationResultsByAttackPattern
                                  .InjectExpectationResultsByType();
                      result.setInjectId(inject.getId());
                      result.setInjectTitle(inject.getTitle());
                      result.setResults(injectMapper.extractExpectationResults(inject));
                      return result;
                    })
                .collect(Collectors.toList()))
        .attackPattern(attackPattern)
        .build();
  }
}
