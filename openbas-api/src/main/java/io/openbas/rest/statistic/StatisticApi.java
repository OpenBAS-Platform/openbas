package io.openbas.rest.statistic;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.StatisticRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.statistic.response.PlatformStatistic;
import io.openbas.rest.statistic.response.StatisticElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static io.openbas.config.SessionHelper.currentUser;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

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
    OpenBASPrincipal user = currentUser();
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
