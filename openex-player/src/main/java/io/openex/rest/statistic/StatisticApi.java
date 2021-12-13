package io.openex.rest.statistic;

import io.openex.database.model.Exercise;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.statistic.response.ExerciseStatistic;
import io.openex.rest.statistic.response.PlatformStatistic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatisticApi<T>  extends RestBehavior {

    private ExerciseRepository exerciseRepository;
    private UserRepository userRepository;
    private InjectRepository<T> injectRepository;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository<T> injectRepository) {
        this.injectRepository = injectRepository;
    }

    @GetMapping("/api/statistics")
    public PlatformStatistic platformStatistic() {
        long exercisesCount = exerciseRepository.count();
        long usersCount = userRepository.count();
        long injectsCount = injectRepository.count();
        return new PlatformStatistic(exercisesCount, usersCount, injectsCount);
    }

    @GetMapping("/api/exercises/{exerciseId}/statistics")
    public ExerciseStatistic exerciseStatistic(@PathVariable String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        long numberOfIncidents = exercise.getEvents().stream()
                .mapToLong(event -> event.getIncidents().size()).sum();
        return new ExerciseStatistic(numberOfIncidents);
    }
}