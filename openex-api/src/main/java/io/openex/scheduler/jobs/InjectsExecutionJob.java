package io.openex.scheduler.jobs;

import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.DryInjectRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Injector;
import io.openex.helper.InjectHelper;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import static io.openex.database.model.Execution.executionError;
import static java.time.Instant.now;
import static java.util.stream.Collectors.groupingBy;

@Component
@DisallowConcurrentExecution
public class InjectsExecutionJob implements Job {

    private static final Logger LOGGER = Logger.getLogger(InjectsExecutionJob.class.getName());
    private ApplicationContext context;
    private InjectHelper injectHelper;
    private DryInjectRepository dryInjectRepository;
    private InjectRepository injectRepository;
    private ExerciseRepository exerciseRepository;

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setDryInjectRepository(DryInjectRepository dryInjectRepository) {
        this.dryInjectRepository = dryInjectRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Override
    @Transactional
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            // Handle starting exercises if needed.
            List<Exercise> exercises = exerciseRepository.findAllShouldBeInRunningState(now());
            exercises.stream().parallel().forEach(exercise -> {
                exercise.setStatus(Exercise.STATUS.RUNNING);
                exercise.setUpdatedAt(now());
                exerciseRepository.save(exercise);
            });
            List<ExecutableInject> injects = injectHelper.getInjectsToRun();
            // Get all injects to execute grouped by exercise.
            Map<Exercise, List<ExecutableInject>> byExercises = injects.stream()
                    .collect(groupingBy(ex -> ex.getInject().getExercise()));
            // Execute injects in parallel for each exercise.
            byExercises.entrySet().stream().parallel().forEach(entry -> {
                Exercise exercise = entry.getKey();
                List<ExecutableInject> executableInjects = entry.getValue();
                // Execute each inject for the exercise in order.
                executableInjects.forEach(executableInject -> {
                    Injection source = executableInject.getSource();
                    Contract contract = executableInject.getContract();
                    Execution execution;
                    if (contract == null) {
                        execution = executionError(executableInject.isRuntime(), "injector", "Inject is not available for execution");
                    } else {
                        Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
                        execution = executor.executeInjection(executableInject);
                    }
                    // Report inject execution
                    if (source instanceof Inject) {
                        Inject executedInject = injectRepository.findById(source.getId()).orElseThrow();
                        executedInject.setStatus(InjectStatus.fromExecution(execution, executedInject));
                        injectRepository.save(executedInject);
                    }
                    // Report dry inject execution
                    if (source instanceof DryInject) {
                        DryInject executedDry = dryInjectRepository.findById(source.getId()).orElseThrow();
                        executedDry.setStatus(DryInjectStatus.fromExecution(execution, executedDry));
                        dryInjectRepository.save(executedDry);
                    }
                });
                // Update the exercise
                exercise.setUpdatedAt(now());
                exerciseRepository.save(exercise);
            });
            // Change status of finished exercises.
            List<Exercise> mustBeFinishedExercises = exerciseRepository.thatMustBeFinished();
            exerciseRepository.saveAll(mustBeFinishedExercises.stream()
                    .peek(exercise -> {
                        exercise.setStatus(Exercise.STATUS.FINISHED);
                        exercise.setUpdatedAt(now());
                    }).toList());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, e.getMessage(), e);
            throw new JobExecutionException(e);
        }
    }
}
