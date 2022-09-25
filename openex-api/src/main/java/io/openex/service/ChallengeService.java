package io.openex.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.Challenge;
import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.repository.ChallengeRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.injects.challenge.model.ChallengeContent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import javax.annotation.Resource;
import java.util.List;
import java.util.stream.Stream;

import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.challenge.ChallengeContract.CHALLENGE_PUBLISH;

@Service
public class ChallengeService {

    @Resource
    protected ObjectMapper mapper;

    private ExerciseRepository exerciseRepository;
    private ChallengeRepository challengeRepository;
    private InjectRepository injectRepository;

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setChallengeRepository(ChallengeRepository challengeRepository) {
        this.challengeRepository = challengeRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public Challenge enrichChallengeWithExercises(Challenge challenge) {
        List<Inject> injects = fromIterable(injectRepository
                .findAllForChallengeId("%" + challenge.getId() + "%"));
        List<String> exerciseIds = injects.stream().map(i -> i.getExercise().getId()).distinct().toList();
        challenge.setExerciseIds(exerciseIds);
        return challenge;
    }

    public Iterable<Challenge> getExerciseChallenges(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<String> challenges = exercise.getInjects().stream()
                .filter(inject -> inject.getContract().equals(CHALLENGE_PUBLISH))
                .filter(inject -> inject.getContent() != null)
                .flatMap(inject -> {
                    try {
                        ChallengeContent content = mapper.treeToValue(inject.getContent(), ChallengeContent.class);
                        return content.getChallenges().stream();
                    } catch (JsonProcessingException e) {
                        return Stream.empty();
                    }
                })
                .distinct().toList();
        return fromIterable(challengeRepository.findAllById(challenges)).stream()
                .map(this::enrichChallengeWithExercises).toList();
    }
}
