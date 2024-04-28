package io.openbas.rest.exercise;

import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.AtomicTestingMapper.InjectTargetWithResult;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.exercise.form.ExerciseInjectExpectationResultsByType;
import io.openbas.rest.exercise.form.ExerciseInjectExpectationResultsByType.InjectExpectationResultsByType;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.openbas.atomic_testing.AtomicTestingUtils.getExpectations;
import static io.openbas.atomic_testing.AtomicTestingUtils.getTargetsWithResults;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final InjectorContractRepository injectorContractRepository;

    // -- GLOBAL SCORE --

    public static List<ExpectationResultsByType> computeGlobalExpectationResults(@NotNull final Exercise exercise) {
        List<InjectExpectation> expectations = exercise.getInjects()
                .stream()
                .flatMap((inject) -> inject.getExpectations().stream())
                .toList();
        return getExpectations(expectations);
    }

    public List<ExerciseInjectExpectationResultsByType> computeInjectExpectationResults(
            @NotNull final Exercise exercise) {
        Map<AttackPattern, List<Inject>> groupedByAttackPattern = exercise.getInjects()
                .stream()
                .flatMap((inject) -> {
                            InjectorContract injectorContract = inject.getInjectorContract();
                            return injectorContract.getAttackPatterns().stream().map(attackPattern -> java.util.Map.entry(attackPattern, inject));
                        }
                )
                .collect(Collectors.groupingBy(
                        java.util.Map.Entry::getKey,
                        Collectors.mapping(java.util.Map.Entry::getValue, Collectors.toList())
                ));

        return groupedByAttackPattern.entrySet().stream()
                .map(entry -> createExerciseInjectResults(entry.getKey(), entry.getValue()))
                .toList();
    }

    private static ExerciseInjectExpectationResultsByType createExerciseInjectResults(
            AttackPattern attackPattern,
            List<Inject> injects) {
        ExerciseInjectExpectationResultsByType results = new ExerciseInjectExpectationResultsByType();
        List<InjectExpectationResultsByType> injectResults = injects.stream()
                .map(inject -> {
                    InjectExpectationResultsByType result = new InjectExpectationResultsByType();
                    result.setInject(inject);
                    result.setResults(getExpectations(inject.getExpectations()));
                    return result;
                })
                .toList();
        results.setResults(injectResults);
        results.setAttackPattern(attackPattern);
        return results;
    }

    // -- TARGET --

    public static List<InjectTargetWithResult> computeTargetResults(@NotNull final Exercise exercise) {
        return exercise.getInjects()
                .stream()
                .flatMap((inject) -> getTargetsWithResults(inject).stream())
                .toList();
    }

}
