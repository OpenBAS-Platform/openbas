package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.Team;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.List;

import static io.openbas.database.model.Exercise.STATUS.SCHEDULED;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.MANUAL;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.injectors.email.EmailContract.TYPE;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ExerciseExpectationServiceTest {

    public static final String EXPECTATION_NAME = "The animation team can validate the audience reaction";
    @Autowired
    private ExerciseExpectationService exerciseExpectationService;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private InjectRepository injectRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private InjectExpectationRepository injectExpectationRepository;

    @Autowired
    private InjectorContractRepository injectorContractRepository;

    static String EXERCISE_ID;

    @BeforeAll
    void beforeAll() {
        Exercise exercise = new Exercise();
        exercise.setName("Exercice name");
        exercise.setStatus(SCHEDULED);
        exercise.setFrom("test@test.com");
        exercise.setReplyTos(List.of("test@test.com"));
        exercise.setStart(Instant.now());
        Exercise exerciseCreated = this.exerciseRepository.save(exercise);
        Team team = new Team();
        team.setName("test");
        Team teamCreated = this.teamRepository.save(team);
        EXERCISE_ID = exerciseCreated.getId();
        Inject inject = new Inject();
        inject.setTitle("test");
        inject.setType(TYPE);
        inject.setInjectorContract(injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
        inject.setExercise(exerciseCreated);
        inject.setDependsDuration(0L);
        Inject injectCreated = this.injectRepository.save(inject);
        InjectExpectation expectation = new InjectExpectation();
        expectation.setInject(injectCreated);
        expectation.setTeam(teamCreated);
        expectation.setType(MANUAL);
        expectation.setName(EXPECTATION_NAME);
        expectation.setExpectedScore(10);
        expectation.setExercise(exercise);
        this.injectExpectationRepository.save(expectation);
    }

    @DisplayName("Retrieve inject expectations")
    @Test
    void retrieveInjectExpectations() {
        List<InjectExpectation> expectations = this.exerciseExpectationService.injectExpectations(EXERCISE_ID);
        assertNotNull(expectations);

        assertEquals(EXPECTATION_NAME, expectations.get(0).getName());
    }

    @DisplayName("Update inject expectation")
    @Test
    void updateInjectExpectation() {
        // -- PREPARE --
        List<InjectExpectation> expectations = this.exerciseExpectationService.injectExpectations(EXERCISE_ID);
        assertNotNull(expectations);
        String id = expectations.get(0).getId();

        // -- EXECUTE --
        ExpectationUpdateInput input = new ExpectationUpdateInput();
        input.setScore(7);
        InjectExpectation expectation = this.exerciseExpectationService.updateInjectExpectation(id, input);

        // -- ASSERT --
        assertNotNull(expectation);
        assertEquals(7, expectation.getScore());
    }
}
