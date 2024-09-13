package io.openbas.scheduler.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.QueueService;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionExecutorService;
import io.openbas.helper.InjectHelper;
import io.openbas.service.AtomicTestingService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
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
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.time.Instant.now;
import static java.util.stream.Collectors.groupingBy;

@Component
@DisallowConcurrentExecution
@RequiredArgsConstructor
public class InjectsExecutionJob implements Job {

    private static final Logger LOGGER = Logger.getLogger(InjectsExecutionJob.class.getName());

    private final ApplicationContext context;
    private final InjectHelper injectHelper;
    private final DryInjectRepository dryInjectRepository;
    private final InjectRepository injectRepository;
    private final InjectorRepository injectorRepository;
    private final InjectStatusRepository injectStatusRepository;
    private final DryInjectStatusRepository dryInjectStatusRepository;
    private final ExerciseRepository exerciseRepository;
    private final QueueService queueService;
    private final ExecutionExecutorService executionExecutorService;
    private final AtomicTestingService atomicTestingService;

    private final List<ExecutionStatus> executionStatusesNotReady =
            List.of(ExecutionStatus.QUEUING, ExecutionStatus.DRAFT, ExecutionStatus.EXECUTING, ExecutionStatus.PENDING);

    @Resource
    protected ObjectMapper mapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public void handleAutoStartExercises() {
        List<Exercise> exercises = exerciseRepository.findAllShouldBeInRunningState(now());
        exerciseRepository.saveAll(exercises.stream()
                .peek(exercise -> {
                    exercise.setStatus(ExerciseStatus.RUNNING);
                    exercise.setUpdatedAt(now());
                }).toList());
    }

    public void handleAutoClosingExercises() {
        // Change status of finished exercises.
        List<Exercise> mustBeFinishedExercises = exerciseRepository.thatMustBeFinished();
        exerciseRepository.saveAll(mustBeFinishedExercises.stream()
                .peek(exercise -> {
                    exercise.setStatus(ExerciseStatus.FINISHED);
                    exercise.setEnd(now());
                    exercise.setUpdatedAt(now());
                }).toList());
    }

    private void executeExternal(ExecutableInject executableInject) {
        Inject inject = executableInject.getInjection().getInject();
        inject.getInjectorContract().ifPresent(injectorContract -> {
            Injection source = executableInject.getInjection();
            Inject executingInject = null;
            InjectStatus injectRunningStatus = null;
            DryInjectStatus dryInjectRunningStatus = null;
            if (source instanceof Inject) {
                executingInject = injectRepository.findById(source.getId()).orElseThrow();
                injectRunningStatus = executingInject.getStatus().orElseThrow();
            }
            if (source instanceof DryInject) {
                DryInject executingInjectDry = dryInjectRepository.findById(source.getId()).orElseThrow();
                dryInjectRunningStatus = executingInjectDry.getStatus().orElseThrow();
            }
            try {
                String jsonInject = mapper.writeValueAsString(executableInject);
                queueService.publish(injectorContract.getInjector().getType(), jsonInject);
            } catch (Exception e) {
                if (source instanceof Inject) {
                    injectRunningStatus.getTraces().add(InjectStatusExecution.traceError(e.getMessage()));
                    injectStatusRepository.save(injectRunningStatus);
                    executingInject.setUpdatedAt(now());
                    injectRepository.save(executingInject);
                }
                if (source instanceof DryInject) {
                    dryInjectRunningStatus.getTraces().add(InjectStatusExecution.traceError(e.getMessage()));
                    dryInjectStatusRepository.save(dryInjectRunningStatus);
                }
            }
        });
    }

    private void executeInternal(ExecutableInject executableInject) {
        Injection source = executableInject.getInjection();
        // Execute
        source.getInject().getInjectorContract().ifPresent(injectorContract -> {
            io.openbas.execution.Injector executor = context.getBean(injectorContract.getInjector().getType(), io.openbas.execution.Injector.class);
            Execution execution = executor.executeInjection(executableInject);
            // After execution, expectations are already created
            // Injection status is filled after complete execution
            // Report inject execution
            if (source instanceof Inject) {
                Inject executedInject = injectRepository.findById(source.getId()).orElseThrow();
                InjectStatus completeStatus = InjectStatus.fromExecution(execution, executedInject);
                injectStatusRepository.save(completeStatus);
                executedInject.setUpdatedAt(now());
                executedInject.setStatus(completeStatus);
                injectRepository.save(executedInject);
            }
            // Report dry inject execution
            if (source instanceof DryInject) {
                DryInject executedDry = dryInjectRepository.findById(source.getId()).orElseThrow();
                DryInjectStatus completeStatus = DryInjectStatus.fromExecution(execution, executedDry);
                dryInjectStatusRepository.save(completeStatus);
                executedDry.setStatus(completeStatus);
                dryInjectRepository.save(executedDry);
            }
        });
    }

    private void executeInject(ExecutableInject executableInject) {
        // Depending on injector type (internal or external) execution must be done differently
        Inject inject = executableInject.getInjection().getInject();

        // We are now checking if we depend on another inject and if it did not failed
        if (inject.getDependsOn() != null
                && inject.getDependsOn().getStatus().isPresent()
                && ( inject.getDependsOn().getStatus().get().getName().equals(ExecutionStatus.ERROR)
                    || executionStatusesNotReady.contains(inject.getDependsOn().getStatus().get().getName()))) {
            InjectStatus status = new InjectStatus();
            if (inject.getStatus().isEmpty()) {
                status.setInject(inject);
            } else {
                status = inject.getStatus().get();
            }
            String errorMsg = inject.getDependsOn().getStatus().get().getName().equals(ExecutionStatus.ERROR) ?
                    "The inject is depending on another inject that failed"
                    : "The inject is depending on another inject that is not executed yet";
            status.getTraces().add(InjectStatusExecution.traceError(errorMsg));
            status.setName(ExecutionStatus.ERROR);
            status.setTrackingSentDate(Instant.now());
            status.setCommandsLines(atomicTestingService.getCommandsLinesFromInject(inject));
            injectStatusRepository.save(status);
        } else {
            inject.getInjectorContract().ifPresent(injectorContract -> {

                if (!inject.isReady()) {
                    // Status
                    if (inject.getStatus().isEmpty()) {
                        InjectStatus status = new InjectStatus();
                        status.getTraces().add(InjectStatusExecution.traceError("The inject is not ready to be executed (missing mandatory fields)"));
                        status.setName(ExecutionStatus.ERROR);
                        status.setTrackingSentDate(Instant.now());
                        status.setInject(inject);
                        status.setCommandsLines(atomicTestingService.getCommandsLinesFromInject(inject));
                        injectStatusRepository.save(status);
                    } else {
                        InjectStatus status = inject.getStatus().get();
                        status.getTraces().add(InjectStatusExecution.traceError("The inject is not ready to be executed (missing mandatory fields)"));
                        status.setName(ExecutionStatus.ERROR);
                        status.setTrackingSentDate(Instant.now());
                        status.setCommandsLines(atomicTestingService.getCommandsLinesFromInject(inject));
                        injectStatusRepository.save(status);
                    }
                    return;
                }

                Injector externalInjector = injectorRepository.findByType(injectorContract.getInjector().getType()).orElseThrow();
                LOGGER.log(Level.INFO, "Executing inject " + inject.getInject().getTitle());
                // Executor logics
                ExecutableInject newExecutableInject = executableInject;
                if (Boolean.TRUE.equals(injectorContract.getNeedsExecutor())) {
                    try {
                        // Status
                        if (inject.getStatus().isEmpty()) {
                            InjectStatus status = new InjectStatus();
                            status.setName(ExecutionStatus.EXECUTING);
                            status.setTrackingSentDate(Instant.now());
                            status.setInject(inject);
                            status.setCommandsLines(atomicTestingService.getCommandsLinesFromInject(inject));
                            injectStatusRepository.save(status);
                        } else {
                            InjectStatus status = inject.getStatus().get();
                            status.setName(ExecutionStatus.EXECUTING);
                            status.setTrackingSentDate(Instant.now());
                            status.setCommandsLines(atomicTestingService.getCommandsLinesFromInject(inject));
                            injectStatusRepository.save(status);
                        }
                        newExecutableInject = this.executionExecutorService.launchExecutorContext(executableInject, inject);
                    } catch (InterruptedException e) {
                        throw new RuntimeException(e);
                    }
                }
                if (externalInjector.isExternal()) {
                    executeExternal(newExecutableInject);
                } else {
                    executeInternal(newExecutableInject);
                }
            });
        }
    }

    public void updateExercise(String exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        exercise.setUpdatedAt(now());
        exerciseRepository.save(exercise);
    }

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        try {
            // Handle starting exercises if needed.
            handleAutoStartExercises();
            // Get all injects to execute grouped by exercise.
            List<ExecutableInject> injects = injectHelper.getInjectsToRun();
            Map<String, List<ExecutableInject>> byExercises = injects.stream().collect(groupingBy(ex -> ex.getInjection().getExercise() == null ? "atomic" : ex.getInjection().getExercise().getId()));
            // Execute injects in parallel for each exercise.
            byExercises.forEach((exercise, executableInjects) -> {
                // Execute each inject for the exercise in order.
                executableInjects.forEach(this::executeInject);
                // Update the exercise
                if (!exercise.equals("atomic")) {
                    updateExercise(exercise);
                }
            });
            // Change status of finished exercises.
            handleAutoClosingExercises();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, e.getMessage(), e);
            throw new JobExecutionException(e);
        }
    }
}
