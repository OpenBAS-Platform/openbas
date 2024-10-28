package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.helper.MonoIdDeserializer;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.utils.AtomicTestingUtils;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Data;

@Data
public class InjectExpectationResultsByAttackPattern {

  @JsonProperty("inject_expectation_results")
  private List<InjectExpectationResultsByType> results;

  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_attack_pattern")
  private AttackPattern attackPattern;

  @Data
  public static class InjectExpectationResultsByType {

    @JsonProperty("inject_title")
    private String injectTitle;

    @JsonProperty("results")
    private List<ExpectationResultsByType> results;
  }

  public InjectExpectationResultsByAttackPattern(
      final AttackPattern attackPattern, @NotNull final List<Inject> injects) {
    this.results =
        injects.stream()
            .map(
                inject -> {
                  InjectExpectationResultsByType result = new InjectExpectationResultsByType();
                  result.setInjectTitle(inject.getTitle());
                  result.setResults(
                      AtomicTestingUtils.getExpectationResultByTypes(inject.getExpectations()));
                  return result;
                })
            .collect(Collectors.toList());
    this.attackPattern = attackPattern;
  }

  public InjectExpectationResultsByAttackPattern() {}
}
