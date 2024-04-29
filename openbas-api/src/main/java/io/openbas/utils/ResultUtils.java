package io.openbas.utils;

import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.AtomicTestingMapper.InjectTargetWithResult;
import io.openbas.database.model.*;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.openbas.atomic_testing.AtomicTestingUtils.getExpectations;
import static io.openbas.atomic_testing.AtomicTestingUtils.getTargetsWithResults;

public class ResultUtils {

  // -- GLOBAL SCORE --

  public static List<ExpectationResultsByType> computeGlobalExpectationResults(@NotNull final List<Inject> injects) {
    List<InjectExpectation> expectations = injects
        .stream()
        .flatMap((inject) -> inject.getExpectations().stream())
        .toList();
    return getExpectations(expectations);
  }

  public static List<InjectExpectationResultsByAttackPattern> computeInjectExpectationResults(@NotNull final List<Inject> injects) {
    Map<AttackPattern, List<Inject>> groupedByAttackPattern = injects.stream()
        .flatMap((inject) -> inject.getInjectorContract()
            .getAttackPatterns()
            .stream()
            .map(attackPattern -> Map.entry(attackPattern, inject))
        )
        .collect(Collectors.groupingBy(
            java.util.Map.Entry::getKey,
            Collectors.mapping(java.util.Map.Entry::getValue, Collectors.toList())
        ));

    return groupedByAttackPattern.entrySet()
        .stream()
        .map(entry -> new InjectExpectationResultsByAttackPattern(entry.getKey(), entry.getValue()))
        .toList();
  }

  // -- TARGET --

  public static List<InjectTargetWithResult> computeTargetResults(@NotNull final List<Inject> injects) {
    return injects.stream()
        .flatMap((inject) -> getTargetsWithResults(inject).stream())
        .toList();
  }

}
