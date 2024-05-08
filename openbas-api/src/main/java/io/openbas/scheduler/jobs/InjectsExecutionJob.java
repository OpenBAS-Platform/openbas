package io.openbas.scheduler.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.helper.InjectHelper;
import io.openbas.service.QueueService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

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
    private InjectorRepository injectorRepository;
    private InjectStatusRepository injectStatusRepository;
    private DryInjectStatusRepository dryInjectStatusRepository;
    private ExerciseRepository exerciseRepository;
    private QueueService queueService;

    @Resource
    protected ObjectMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Autowired
    public void setQueueService(QueueService queueService) {
        this.queueService = queueService;
    }

    @Autowired
    public void setDryInjectStatusRepository(DryInjectStatusRepository dryInjectStatusRepository) {
        this.dryInjectStatusRepository = dryInjectStatusRepository;
    }

    @Autowired
    public void setInjectStatusRepository(InjectStatusRepository injectStatusRepository) {
        this.injectStatusRepository = injectStatusRepository;
    }

    @Autowired
    public void setInjectorRepository(InjectorRepository injectorRepository) {
        this.injectorRepository = injectorRepository;
    }

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

    public void handleAutoStartExercises() {
        List<Exercise> exercises = exerciseRepository.findAllShouldBeInRunningState(now());
        exerciseRepository.saveAll(exercises.stream()
                .peek(exercise -> {
                    exercise.setStatus(Exercise.STATUS.RUNNING);
                    exercise.setUpdatedAt(now());
                }).toList());
    }

    public void handleAutoClosingExercises() {
        // Change status of finished exercises.
        List<Exercise> mustBeFinishedExercises = exerciseRepository.thatMustBeFinished();
        exerciseRepository.saveAll(mustBeFinishedExercises.stream()
                .peek(exercise -> {
                    exercise.setStatus(Exercise.STATUS.FINISHED);
                    exercise.setEnd(now());
                    exercise.setUpdatedAt(now());
                }).toList());
    }

    private void executeExternal(ExecutableInject executableInject) {
        Inject inject = executableInject.getInjection().getInject();
        InjectStatus status = new InjectStatus();
        status.setTrackingSentDate(Instant.now());
        status.setInject(inject);
        try {
            String jsonInject = mapper.writeValueAsString(executableInject);
            injectStatusRepository.save(status);
            queueService.publish(inject.getInjectorContract().getInjector().getType(), jsonInject);
        } catch (Exception e) {
            status.getTraces().add(InjectStatusExecution.traceError(e.getMessage()));
            injectStatusRepository.save(status);
        }
    }

    private void executeInternal(ExecutableInject executableInject) {
        Injection source = executableInject.getInjection();
        // Initialize the inject status
        InjectStatus status = new InjectStatus();
        status.setTrackingSentDate(Instant.now());
        status.setInject(executableInject.getInjection().getInject());
        // Execute
        io.openbas.execution.Injector executor = context.getBean(source.getInject().getInjectorContract().getInjector().getType(), io.openbas.execution.Injector.class);
        Execution execution = executor.executeInjection(executableInject);
        // After execution, expectations are already created
        // Injection status is filled after complete execution
        // Report inject execution
        if (source instanceof Inject) {
            Inject executedInject = injectRepository.findById(source.getId()).orElseThrow();
            InjectStatus completeStatus = InjectStatus.fromExecution(execution, executedInject);
            injectStatusRepository.save(completeStatus);
        }
        // Report dry inject execution
        if (source instanceof DryInject) {
            DryInject executedDry = dryInjectRepository.findById(source.getId()).orElseThrow();
            DryInjectStatus completeStatus = DryInjectStatus.fromExecution(execution, executedDry);
            dryInjectStatusRepository.save(completeStatus);
        }
    }

    public void executeInject(ExecutableInject executableInject) {
        // Depending on injector type (internal or external) execution must be done differently
        Inject inject = executableInject.getInjection().getInject();
        Injector externalInjector = injectorRepository.findByType(inject.getInjectorContract().getInjector().getType()).orElseThrow();
        if (externalInjector.isExternal()) {
            executeExternal(executableInject);
        } else {
            executeInternal(executableInject);
        }
    }

    public void updateExercise(String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setUpdatedAt(now());
        exerciseRepository.save(exercise);
    }

    @Override
    @Transactional
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            // Handle starting exercises if needed.
            handleAutoStartExercises();
            // Get all injects to execute grouped by exercise.
            List<ExecutableInject> injects = injectHelper.getInjectsToRun();
            Map<Exercise, List<ExecutableInject>> byExercises = injects.stream().collect(groupingBy(ex -> ex.getInjection().getExercise()));
            // Execute injects in parallel for each exercise.
            byExercises.entrySet().stream().parallel().forEach(entry -> {
                Exercise exercise = entry.getKey();
                List<ExecutableInject> executableInjects = entry.getValue();
                // Execute each inject for the exercise in order.
                executableInjects.forEach(this::executeInject);
                // Update the exercise
                updateExercise(exercise.getId());
            });
            // Change status of finished exercises.
            handleAutoClosingExercises();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, e.getMessage(), e);
            throw new JobExecutionException(e);
        }
    }
}
