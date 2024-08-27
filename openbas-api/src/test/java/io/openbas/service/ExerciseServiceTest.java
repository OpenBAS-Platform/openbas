package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.ArticleRepository;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.rest.exercise.ExerciseService;
import io.openbas.rest.inject.service.InjectDuplicateService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.utils.fixtures.TeamFixture.getTeam;
import static io.openbas.utils.fixtures.ExerciseFixture.getExercise;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

@SpringBootTest
public class ExerciseServiceTest {
    @Mock
    GrantService grantService;
    @Mock
    InjectService injectService;
    @Mock
    InjectDuplicateService injectDuplicateService;
    @Autowired
    private TeamService teamService;
    @Mock
    VariableService variableService;

    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private TeamRepository teamRepository;

    @InjectMocks
    private ExerciseService exerciseService;
    @BeforeEach
    void setUp() {
        exerciseService = new ExerciseService(grantService, injectService, injectDuplicateService,
                teamService,variableService, articleRepository,exerciseRepository,teamRepository);
    }

    @DisplayName("Should create new contextual teams while exercise duplication")
    @Test
    @Transactional(rollbackOn = Exception.class)
    void createNewContextualTeamsWhileExerciseDuplication(){
        // -- PREPARE --
        List<Team> exerciseTeams = new ArrayList<>();;
        Team contextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName1", true));
        exerciseTeams.add(contextualTeam);
        Team noContextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName2",false));
        exerciseTeams.add(noContextualTeam);
        Exercise exercise = this.exerciseRepository.save(getExercise(exerciseTeams));

        // -- EXECUTE --
        Exercise exerciseDuplicated = exerciseService.getDuplicateExercise(exercise.getId());

        // -- ASSERT --
        assertNotEquals(exercise.getId(), exerciseDuplicated.getId());
        assertEquals(2, exerciseDuplicated.getTeams().size());
        exerciseDuplicated.getTeams().forEach(team -> {
            if (team.getContextual()){
                assertNotEquals(contextualTeam.getId(), team.getId());
                assertEquals(contextualTeam.getName(), team.getName());
            } else {
                assertEquals(noContextualTeam.getId(), team.getId());
            }
        });
    }
}
