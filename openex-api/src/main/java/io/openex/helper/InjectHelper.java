package io.openex.helper;

import io.openex.config.OpenExConfig;
import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.AudienceRepository;
import io.openex.database.repository.DryInjectRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.specification.DryInjectSpecification;
import io.openex.database.specification.InjectSpecification;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.database.specification.AudienceSpecification.fromExercise;
import static io.openex.helper.StreamHelper.fromIterable;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Stream.concat;

@Component
public class InjectHelper {

    @Resource
    private OpenExConfig openExConfig;
    private InjectRepository injectRepository;
    private DryInjectRepository dryInjectRepository;
    private AudienceRepository audienceRepository;
    private ContractService contractService;

    @Autowired
    public void setContractService(ContractService contractService) {
        this.contractService = contractService;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setDryInjectRepository(DryInjectRepository dryInjectRepository) {
        this.dryInjectRepository = dryInjectRepository;
    }

    private List<Audience> getInjectAudiences(Inject inject) {
        Exercise exercise = inject.getExercise();
        return inject.isAllAudiences() ?
                fromIterable(audienceRepository.findAll(fromExercise(exercise.getId()))) : inject.getAudiences();
    }

    private Stream<ExecutionContext> getUsersFromInjection(Injection injection) {
        if (injection instanceof DryInject dryInject) {
            return dryInject.getRun().getUsers().stream()
                    .map(user -> new ExecutionContext(openExConfig, user, injection, "Dryrun"));
        } else if (injection instanceof Inject inject) {
            List<Audience> audiences = getInjectAudiences(inject);
            return audiences.stream().filter(Audience::isEnabled)
                    .flatMap(audience -> audience.getUsers().stream()
                            .map(user -> new ExecutionContext(openExConfig, user, injection, audience.getName())));
        }
        throw new UnsupportedOperationException("Unsupported type of Injection");
    }

    private List<ExecutionContext> usersFromInjection(Injection injection) {
        return getUsersFromInjection(injection)
                .collect(groupingBy(ExecutionContext::getUser)).entrySet().stream()
                .map(entry -> new ExecutionContext(openExConfig, entry.getKey(), injection,
                        entry.getValue().stream().flatMap(ua -> ua.getAudiences().stream()).toList()))
                .toList();
    }

    private boolean isBeforeOrEqualsNow(Injection injection) {
        Instant now = Instant.now();
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.equals(now) || injectWhen.isBefore(now);
    }

    public List<ExecutableInject> getInjectsToRun() {
        // Get injects
        List<Inject> executableInjects = injectRepository.findAll(InjectSpecification.executable());
        Stream<ExecutableInject> injects = executableInjects.stream()
                .filter(this::isBeforeOrEqualsNow)
                .sorted(Inject.executionComparator)
                .map(inject -> {
                    Contract contract = contractService.resolveContract(inject);
                    List<Audience> audiences = getInjectAudiences(inject);
                    return new ExecutableInject(true,false, inject, contract, audiences, usersFromInjection(inject));
                });
        // Get dry injects
        List<DryInject> executableDryInjects = dryInjectRepository.findAll(DryInjectSpecification.executable());
        Stream<ExecutableInject> dryInjects = executableDryInjects.stream()
                .filter(this::isBeforeOrEqualsNow)
                .sorted(DryInject.executionComparator)
                .map(dry -> {
                    Inject inject = dry.getInject();
                    Contract contract = contractService.resolveContract(inject);
                    List<Audience> audiences = getInjectAudiences(inject);
                    return new ExecutableInject(false, false, dry, inject, contract, audiences, usersFromInjection(dry));
                });
        // Combine injects and dry
        return concat(injects, dryInjects)
                .filter(executableInject -> executableInject.getContract() == null || !executableInject.getContract().isManual())
                .collect(Collectors.toList());
    }
}
