package io.openbas.rest.inject.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Validated
public class InjectDuplicateService {

    private final ExerciseRepository exerciseRepository;
    private final ScenarioRepository scenarioRepository;
    private final InjectRepository injectRepository;

    public Inject createInjectForScenario(@NotBlank final String scenarioId, @NotBlank final String injectId) {
        return getDuplicateInjectForScenario(scenarioId, injectId);
    }

    public Inject createInjectForExercise(final String exerciseId, final String injectId) {
        return getDuplicateInjectForExercise(exerciseId, injectId);
    }

    @NotNull
    private Inject getDuplicateInjectForScenario(@NotBlank final String scenarioId, @NotBlank final String injectId) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow();
        Inject inject = copyInject(injectId);
        inject.setScenario(scenario);
        return injectRepository.save(inject);
    }

    @NotNull
    private Inject getDuplicateInjectForExercise(@NotBlank String exerciseId, @NotBlank String injectId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Inject inject = copyInject(injectId);
        inject.setExercise(exercise);
        return injectRepository.save(inject);
    }

    @NotNull
    private Inject copyInject(@NotBlank String injectId) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        Inject injectDuplicate = new Inject();
        injectDuplicate.setAssets(inject.getAssets().stream().toList());
        injectDuplicate.setTeams(inject.getTeams().stream().toList());
        injectDuplicate.setCity(inject.getCity());
        injectDuplicate.setCountry(inject.getCountry());
        injectDuplicate.setUser(inject.getUser());
        injectDuplicate.setInjectorContract(inject.getInjectorContract());
        injectDuplicate.setDependsOn(inject.getDependsOn());
        injectDuplicate.setDependsDuration(inject.getDependsDuration());
        injectDuplicate.setEnabled(inject.isEnabled());
        injectDuplicate.setAllTeams(inject.isAllTeams());
        injectDuplicate.setContent(inject.getContent());
        injectDuplicate.setAssetGroups(inject.getAssetGroups().stream().toList());
        injectDuplicate.setTitle(inject.getTitle());
        injectDuplicate.setTitle(getNewTitle(inject));
        injectDuplicate.setDescription(inject.getDescription());
        injectDuplicate.setCommunications(inject.getCommunications().stream().toList());
        injectDuplicate.setPayloads(inject.getPayloads().stream().toList());
        injectDuplicate.setTags(new HashSet<>(inject.getTags()));
        if (inject.getStatus().isPresent())
            injectDuplicate.setStatus(inject.getStatus().get());

        return injectDuplicate;
    }

    @NotNull
    private static String getNewTitle(@NotNull Inject injectOrigin) {
        String newTitle = injectOrigin.getTitle() + " (duplicate)";
        if (newTitle.length() > 255) {
            newTitle = newTitle.substring(0, 254 - " (duplicate)".length());
        }
        return newTitle;
    }
}
