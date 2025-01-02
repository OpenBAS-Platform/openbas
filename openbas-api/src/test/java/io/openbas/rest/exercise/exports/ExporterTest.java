package io.openbas.rest.exercise.exports;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.helper.InjectHelper;
import io.openbas.injectors.email.model.EmailContent;
import io.openbas.utils.fixtures.*;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.utils.fixtures.InjectFixture.getInjectForEmailContract;
import static java.time.Instant.now;
import static java.time.temporal.ChronoUnit.MINUTES;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

@TestInstance(PER_CLASS)
public class ExporterTest extends IntegrationTest {
    @Autowired private ExerciseRepository exerciseRepository;

    @Autowired private InjectRepository injectRepository;

    @Autowired private InjectorContractRepository injectorContractRepository;

    @Autowired private UserRepository userRepository;

    @Autowired private TeamRepository teamRepository;

    @Resource
    protected ObjectMapper mapper;

    static Exercise SCHEDULED_EXERCISE;
    static Instant REFERENCE_TIME;

    @BeforeEach
    void beforeAll() {
        REFERENCE_TIME =
                Instant.now(Clock.fixed(Instant.parse("2024-12-17T10:30:45Z"), ZoneId.of("UTC")));
        Exercise scheduledExercise = ExerciseFixture.createDefaultAttackExercise(REFERENCE_TIME);

        InjectorContract injectorContract =
                this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
        Inject inject1 = getInjectForEmailContract(injectorContract);
        EmailContent content = new EmailContent();
        content.setSubject("Subject email");
        content.setBody("A body");
        inject1.setContent(this.mapper.valueToTree(content));
        inject1.setExercise(scheduledExercise);

        User user = userRepository.save(UserFixture.getUser("Tom", "TEST", "tom-test@fake.email"));
        Team team = TeamFixture.getTeam(user, "TeamA", true);
        team.setExercises(
                Arrays.asList(
                        scheduledExercise));
        SCHEDULED_EXERCISE = exerciseRepository.save(scheduledExercise);
        teamRepository.save(team);

        inject1.setTeams(List.of(team));

        injectRepository.save(inject1);
    }

    @Test
    public void when() {}
}
