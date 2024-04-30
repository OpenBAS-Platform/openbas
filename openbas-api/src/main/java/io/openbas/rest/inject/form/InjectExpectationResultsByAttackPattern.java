package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.AtomicTestingUtils;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.helper.MonoIdDeserializer;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class InjectExpectationResultsByAttackPattern {

  @JsonProperty("inject_expectation_results")
  private List<InjectExpectationResultsByType> results;

  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("inject_attack_pattern")
  private AttackPattern attackPattern;

  @Data
  public static class InjectExpectationResultsByType {

    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject")
    private Inject inject;

    @JsonProperty("results")
    private List<ExpectationResultsByType> results;
  }

  public InjectExpectationResultsByAttackPattern(
      final AttackPattern attackPattern,
      @NotNull final List<Inject> injects) {
    this.results = injects.stream()
        .map(inject -> {
          InjectExpectationResultsByType result = new InjectExpectationResultsByType();
          result.setInject(inject);
          result.setResults(AtomicTestingUtils.getExpectationResultByTypes(inject.getExpectations()));
          return result;
        })
        .collect(Collectors.toList());
    this.attackPattern = attackPattern;
  }

}
