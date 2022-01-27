package io.openex.rest.inject;

import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.InjectSpecification;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.Executor;
import io.openex.execution.ExecutionContext;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.form.InjectInput;
import io.openex.rest.inject.form.InjectUpdateActivationInput;
import io.openex.rest.inject.form.InjectUpdateStatusInput;
import io.openex.rest.inject.form.UpdateAudiencesInjectInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.helper.DatabaseHelper.resolveOptionalRelation;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.execution.ExecutionTrace.traceSuccess;
import static java.time.Instant.now;

@RestController
public class InjectApi<T> extends RestBehavior {

    private static final int MAX_NEXT_INJECTS = 6;

    private ExerciseRepository exerciseRepository;
    private InjectRepository<T> injectRepository;
    private InjectReportingRepository injectReportingRepository;
    private AudienceRepository audienceRepository;
    private TagRepository tagRepository;
    private ApplicationContext context;
    private List<Contract> contracts;

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setInjectReportingRepository(InjectReportingRepository injectReportingRepository) {
        this.injectReportingRepository = injectReportingRepository;
    }

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
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @GetMapping("/api/inject_types")
    public List<InjectTypes> injectTypes() {
        return contracts.stream().filter(Contract::expose)
                .map(Contract::toRest).collect(Collectors.toList());
    }

    @GetMapping("/api/injects/try/{injectId}")
    public InjectStatus execute(@PathVariable String injectId) {
        Inject<T> inject = injectRepository.findById(injectId).orElseThrow();
        List<ExecutionContext> userInjectContexts = List.of(new ExecutionContext(currentUser(),
                inject.getExercise(), "Direct test"));
        ExecutableInject<T> injection = new ExecutableInject<>(inject, userInjectContexts);
        Class<? extends Executor<T>> executorClass = inject.executor();
        Executor<T> executor = context.getBean(executorClass);
        Execution execution = executor.execute(injection);
        return InjectStatus.fromExecution(execution, inject);
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
        inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        return injectRepository.save(inject);
    }

    @GetMapping("/api/exercises/{exerciseId}/injects")
    public Iterable<Inject<T>> exerciseInjects(@PathVariable String exerciseId) {
        return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId))
                .stream().sorted(Inject.executionComparator).toList();
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}")
    public Inject<T> exerciseInject(@PathVariable String injectId) {
        return injectRepository.findById(injectId).orElseThrow();
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}/audiences")
    public Iterable<Audience> exerciseInjectAudiences(@PathVariable String injectId) {
        return injectRepository.findById(injectId).orElseThrow().getAudiences();
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
        inject.setDependsOn(resolveOptionalRelation(input.getDependsOn(), injectRepository));
        inject.setAudiences(fromIterable(audienceRepository.findAllById(input.getAudiences())));
        inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
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

    @Transactional
    @PostMapping("/api/injects/{injectId}/status")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Inject<T> setInjectStatus(@PathVariable String injectId,
                                     @Valid @RequestBody InjectUpdateStatusInput input) {
        Inject<T> inject = injectRepository.findById(injectId).orElseThrow();
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setDate(now());
        injectStatus.setName(input.getStatus());
        injectStatus.setExecutionTime(0);
        Execution execution = new Execution();
        execution.addTrace(traceSuccess(currentUser().getId(), input.getMessage()));
        injectStatus.setReporting(execution);
        injectReportingRepository.save(injectStatus);
        inject.setStatus(injectStatus);
        return injectRepository.save(inject);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/audiences")
    @PostAuthorize("isExercisePlanner(#exerciseId)")
    public Inject<T> updateInjectAudiences(@PathVariable String injectId,
                                           @Valid @RequestBody UpdateAudiencesInjectInput input) {
        Inject<T> inject = injectRepository.findById(injectId).orElseThrow();
        Iterable<Audience> injectAudiences = audienceRepository.findAllById(input.getAudienceIds());
        inject.setAudiences(fromIterable(injectAudiences));
        return injectRepository.save(inject);
    }

    @GetMapping("/api/injects/next")
    public List<Inject<T>> nextInjectsToExecute(@RequestParam Optional<Integer> size) {
        return injectRepository.findAll(InjectSpecification.next()).stream()
                // Keep only injects visible by the user
                .filter(inject -> inject.getDate().isPresent())
                .filter(inject -> inject.getExercise().isUserHasAccess(currentUser()))
                // Order by near execution
                .sorted(Inject.executionComparator)
                // Keep only the expected size
                .limit(size.orElse(MAX_NEXT_INJECTS))
                // Collect the result
                .toList();
    }
}
