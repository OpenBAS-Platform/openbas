package io.openbas.rest.exercise;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.ExerciseTeamUser;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.ExerciseTeamUserRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.utils.fixtures.ExerciseFixture;
import io.openbas.utils.fixtures.TeamFixture;
import io.openbas.utils.fixtures.UserFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.fixtures.UserFixture.EMAIL;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class ExerciseApiTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ExerciseTeamUserRepository exerciseTeamUserRepository;

    private static final List<String> EXERCISE_IDS = new ArrayList<>();

    @AfterAll
    void afterAll() {
        this.exerciseRepository.deleteAllById(EXERCISE_IDS);
        this.userRepository.deleteAll();
        this.teamRepository.deleteAll();
        this.exerciseTeamUserRepository.deleteAll();
    }

    @Nested
    @DisplayName("Retrieving exercise informations")
    class RetrievingExercises {
        @Test
        @DisplayName("Retrieving players by exercise")
        @WithMockAdminUser
        void retrievingPlayersByExercise() throws Exception {
            // -- PREPARE --
            User userTom = userRepository.save(UserFixture.getUser("Tom", "TEST", "tom-test@fake.email"));
            User userBen = userRepository.save(UserFixture.getUser("Ben", "TEST", "ben-test@fake.email"));
            Team teamA = teamRepository.save(TeamFixture.getTeam(userTom, "TeamA", false));
            Team teamB = teamRepository.save(TeamFixture.getTeam(userBen, "TeamB", false));

            Exercise exercise = ExerciseFixture.createDefaultCrisisExercise();
            exercise.setTeams(Arrays.asList(teamA, teamB));
            Exercise exerciseSaved = exerciseRepository.save(exercise);
            EXERCISE_IDS.add(exerciseSaved.getId());

            ExerciseTeamUser exerciseTeamUser = new ExerciseTeamUser();
            exerciseTeamUser.setExercise(exerciseSaved);
            exerciseTeamUser.setTeam(teamA);
            exerciseTeamUser.setUser(userTom);
            ExerciseTeamUser exerciseTeamUser2 = new ExerciseTeamUser();
            exerciseTeamUser2.setExercise(exerciseSaved);
            exerciseTeamUser2.setTeam(teamB);
            exerciseTeamUser2.setUser(userBen);
            exerciseTeamUserRepository.saveAll(Arrays.asList(exerciseTeamUser, exerciseTeamUser2));

            mvc.perform(get(EXERCISE_URI + "/"+ exerciseSaved.getId() +"/players")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andExpect(jsonPath("$.length()").value(2))  // Check if the array has 2 elements
                    .andExpect(jsonPath("$[0].user_id").value(userTom.getId()))  // Verify userTom's ID
                    .andExpect(jsonPath("$[1].user_id").value(userBen.getId()));
        }
    }
}
