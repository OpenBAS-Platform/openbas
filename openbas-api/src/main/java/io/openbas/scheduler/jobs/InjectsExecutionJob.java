package io.openbas.scheduler.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.helper.InjectHelper;
import jakarta.annotation.Resource;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeoutException;
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
    private ExerciseRepository exerciseRepository;

    @Resource
    protected ObjectMapper mapper;

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

    private Execution executeExternal(ExecutableInject executableInject) throws IOException, TimeoutException {
        Inject inject = executableInject.getInjection().getInject();
        // 01. Push the execution to the target queue
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("192.168.2.36");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();
        String jsonInject = mapper.writeValueAsString(executableInject);
        String routingKey = "openbas_push_routing_" + inject.getType();
        InjectStatus status = new InjectStatus();
        status.setTrackingSentDate(Instant.now());
        status.setInject(inject);
        InjectStatus savedStatus = injectStatusRepository.save(status);
        try {
            channel.basicPublish("openbas_amqp.connector.exchange", routingKey, null, jsonInject.getBytes());
        } catch (Exception e) {
            injectStatusRepository.delete(savedStatus);
        }
        return new Execution();
    }

    public void executeInject(ExecutableInject executableInject) {
        // TODO Migrate to queue execution
        // Depending on injector type (internal or external) execution must be done differently
        Inject inject = executableInject.getInjection().getInject();
        Optional<Injector> externalInjector = injectorRepository.findByType(inject.getType());
        if (externalInjector.isPresent()) {
            try {
                executeExternal(executableInject);
            } catch (Exception e) {
                // TODO Add log?
            }
        } else {
            Injection source = executableInject.getInjection();
            io.openbas.execution.Injector executor = context.getBean(source.getInject().getType(), io.openbas.execution.Injector.class);
            Execution execution = executor.executeInjection(executableInject);
            // Report inject execution
            if (source instanceof Inject) {
                Inject executedInject = injectRepository.findById(source.getId()).orElseThrow();
                // executedInject.setStatus(InjectStatus.fromExecution(execution, executedInject));
                injectRepository.save(executedInject);
            }
            // Report dry inject execution
            if (source instanceof DryInject) {
                DryInject executedDry = dryInjectRepository.findById(source.getId()).orElseThrow();
                // executedDry.setStatus(DryInjectStatus.fromExecution(execution, executedDry));
                dryInjectRepository.save(executedDry);
            }
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
