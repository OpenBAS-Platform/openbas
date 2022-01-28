package io.openex.rest.statistic;

import io.openex.database.model.User;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.repository.StatisticRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.statistic.response.PlatformStatistic;
import io.openex.rest.statistic.response.StatisticElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static io.openex.config.AppConfig.currentUser;

@RestController
public class StatisticApi extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private UserRepository userRepository;
    private InjectRepository injectRepository;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    private StatisticElement computeGlobalStat(Instant from, StatisticRepository repository) {
        long global = repository.globalCount(from);
        Instant minusMonth = from.minus(30, ChronoUnit.DAYS);
        long progression = global - repository.globalCount(minusMonth);
        return new StatisticElement(global, progression);
    }

    private StatisticElement computeUserStat(Instant from, StatisticRepository repository) {
        User user = currentUser();
        long global = repository.userCount(user.getId(), from);
        Instant minusMonth = from.minus(30, ChronoUnit.DAYS);
        long progression = global - repository.userCount(user.getId(), minusMonth);
        return new StatisticElement(global, progression);
    }

    private StatisticElement computeStat(Instant from, StatisticRepository repository) {
        return currentUser().isAdmin() ? computeGlobalStat(from, repository)
                : computeUserStat(from, repository);
    }

    @GetMapping("/api/statistics")
    public PlatformStatistic platformStatistic() {
        Instant now = Instant.now();
        PlatformStatistic statistic = new PlatformStatistic();
        statistic.setExercisesCount(computeStat(now, exerciseRepository));
        statistic.setInjectsCount(computeStat(now, injectRepository));
        statistic.setUsersCount(computeStat(now, userRepository));
        return statistic;
    }
}