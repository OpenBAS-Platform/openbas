package io.openex.rest.inject;

import io.openex.contract.Contract;
import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.model.InjectTypes;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.specification.InjectSpecification;
import io.openex.helper.InjectHelper;
import io.openex.model.ExecutableInject;
import io.openex.model.Execution;
import io.openex.model.Executor;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.form.InjectInput;
import io.openex.rest.inject.form.InjectUpdateActivationInput;
import io.openex.rest.inject.response.InjectNext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.model.ExecutionStatus.ERROR;
import static java.util.List.of;
import static org.springframework.util.StringUtils.hasLength;

@RestController
public class InjectApi<T> extends RestBehavior {

    private static final int MAX_NEXT_INJECTS = 10;

    private ExerciseRepository exerciseRepository;
    private InjectRepository<T> injectRepository;
    private AudienceRepository audienceRepository;
    private InjectHelper<T> injectHelper;
    private ApplicationContext context;
    private List<Contract> contracts;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }

    @Autowired
    public void setInjectRepository(InjectRepository<T> injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setInjectHelper(InjectHelper<T> injectHelper) {
        this.injectHelper = injectHelper;
    }

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @GetMapping("/api/inject_types")
    public List<InjectTypes> injectTypes() {
        return contracts.stream().filter(Contract::expose)
                .map(Contract::toRest).collect(Collectors.toList());
    }

    @GetMapping("/api/injects/try/{injectId}")
    public Execution execute(@PathVariable String injectId) {
        Optional<Inject<T>> injectOptional = injectRepository.findById(injectId);
        if (injectOptional.isEmpty()) {
            Execution execution = new Execution();
            execution.setStatus(ERROR);
            execution.setMessage(of("Inject to try not found"));
            return execution;
        }
        Inject<T> inject = injectOptional.get();
        ExecutableInject<T> injection = new ExecutableInject<>(inject, injectHelper.buildUsersFromInject(inject));
        Class<? extends Executor<T>> executorClass = inject.executor();
        Executor<T> executor = context.getBean(executorClass);
        return executor.execute(injection);
    }

    @PutMapping("/api/injects/{exerciseId}/{injectId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Inject<T> updateInject(@PathVariable String exerciseId,
                                  @PathVariable String injectId,
                                  @Valid @RequestBody InjectInput<T> input) {
        Inject<T> inject = injectRepository.findById(injectId).orElseThrow();
        inject.setUpdateAttributes(input);
        inject.setContent(input.getContent());
        // Set dependencies
        inject.setDependsOn(updateRelation(input.getDependsOn(), inject.getDependsOn(), injectRepository));
        inject.setAudiences(fromIterable(audienceRepository.findAllById(input.getAudiences())));
        return injectRepository.save(inject);
    }

    @GetMapping("/api/exercises/{exerciseId}/injects")
    public Iterable<Inject<T>> exerciseInjects(@PathVariable String exerciseId) {
        return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/injects")
    public Inject<T> createInject(@PathVariable String exerciseId,
                                  @Valid @RequestBody InjectInput<T> input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        // Get common attributes
        Inject<T> inject = input.toInject();
        // Set dependencies
        inject.setUser(currentUser());
        inject.setExercise(exercise);
        if (hasLength(input.getDependsOn())) {
            inject.setDependsOn(injectRepository.findById(input.getDependsOn()).orElse(null));
        }
        inject.setAudiences(fromIterable(audienceRepository.findAllById(input.getAudiences())));
        return injectRepository.save(inject);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/injects/{injectId}")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteInject(@PathVariable String injectId) {
        injectRepository.deleteById(injectId);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/activation")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Inject<T> updateInjectActivation(@PathVariable String injectId,
                                            @Valid @RequestBody InjectUpdateActivationInput input) {
        Inject<T> inject = injectRepository.findById(injectId).orElseThrow();
        inject.setEnabled(input.isEnabled());
        return injectRepository.save(inject);
    }

    @GetMapping("/api/injects/next")
    public List<InjectNext> nextInjectsToExecute(@RequestParam Optional<Integer> size) {
        Comparator<Inject<T>> injectComparator = Comparator.comparing(Inject::getDate);
        return injectRepository.findAll(InjectSpecification.executable()).stream()
                // Keep only injects visible by the user
                .filter(inject -> inject.getExercise().isUserObserver(currentUser()))
                // Order by near execution
                .sorted(injectComparator.reversed())
                // Keep only the expected size
                .limit(size.orElse(MAX_NEXT_INJECTS))
                // Map to NextInject to keep only useful information
                .map(i -> new InjectNext(i.getTitle(), i.getDescription(), i.getType(), i.getDate()))
                // Collect the result
                .toList();
    }
}
