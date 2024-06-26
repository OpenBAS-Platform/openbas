package io.openbas.rest.inject.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectInput;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class InjectDuplicateService {

    private final ExerciseRepository exerciseRepository;
    private final ScenarioRepository scenarioRepository;
    private final InjectRepository injectRepository;

    public Inject createInjectForScenario(final InjectInput injectInput, final String scenarioId) {
        return getDuplicateInjectForScenario(injectInput, scenarioId);
    }

    public Inject createInjectForExercise(final InjectInput injectInput, final String exerciseId) {
        return getDuplicateInjectForExercise(injectInput, exerciseId);
    }

    private Inject getDuplicateInjectForScenario(InjectInput injectInput, String scenarioId) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow();
        Inject inject = copyInject(injectInput);
        inject.setScenario(scenario);
        return injectRepository.save(inject);
    }

    private Inject getDuplicateInjectForExercise(InjectInput injectInput, String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Inject inject = copyInject(injectInput);
        inject.setExercise(exercise);
        return injectRepository.save(inject);
    }

    private Inject copyInject(InjectInput injectInput) {
        Inject inject = injectRepository.findById(injectInput.getId()).orElseThrow();
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

    private static String getNewTitle(Inject injectOrigin) {
        String newTitle = injectOrigin.getTitle() + " (duplicate)";
        if (newTitle.length() > 255) {
            newTitle = newTitle.substring(0, 254 - " (duplicate)".length());
        }
        return newTitle;
    }
}
