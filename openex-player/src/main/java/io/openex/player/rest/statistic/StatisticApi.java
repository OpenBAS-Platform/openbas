package io.openex.player.rest.statistic;

import io.openex.player.repository.ExerciseRepository;
import io.openex.player.repository.InjectRepository;
import io.openex.player.repository.UserRepository;
import io.openex.player.rest.helper.RestBehavior;
import io.openex.player.rest.statistic.response.PlatformStatistic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/api/statistics")
    public PlatformStatistic statistic() {
        long exercisesCount = exerciseRepository.count();
        long usersCount = userRepository.count();
        long injectsCount = injectRepository.count();
        return new PlatformStatistic(exercisesCount, usersCount, injectsCount);
    }
}
