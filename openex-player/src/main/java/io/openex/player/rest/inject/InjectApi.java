package io.openex.player.rest.inject;

import io.openex.player.helper.InjectHelper;
import io.openex.player.model.ContentBase;
import io.openex.player.model.Contract;
import io.openex.player.model.Executor;
import io.openex.player.model.database.InjectTypes;
import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.Execution;
import io.openex.player.repository.InjectRepository;
import io.openex.player.rest.helper.RestBehavior;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static io.openex.player.model.database.User.ROLE_PLANIFICATEUR;
import static io.openex.player.model.execution.ExecutableInject.prodRun;
import static io.openex.player.model.execution.ExecutionStatus.ERROR;
import static java.util.List.of;

@RestController
public class InjectApi extends RestBehavior {

    private InjectRepository injectRepository;
    private InjectHelper injectHelper;
    private ApplicationContext context;
    private List<Contract> contracts;

    @Autowired
    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setInjectHelper(InjectHelper injectHelper) {
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

    @RolesAllowed({ROLE_PLANIFICATEUR})
    @GetMapping("/api/injects/try/{injectId}")
    public Execution execute(@PathVariable String injectId) {
        Optional<io.openex.player.model.database.Inject<?>> injectOptional = injectRepository.findById(injectId);
        if (injectOptional.isEmpty()) {
            Execution execution = new Execution();
            execution.setStatus(ERROR);
            execution.setMessage(of("Inject to try not found"));
            return execution;
        }
        io.openex.player.model.database.Inject<?> inject = injectOptional.get();
        ExecutableInject<?> injection = prodRun(inject, injectHelper.buildUsersFromInject(inject));
        Class<? extends Executor<?>> executorClass = inject.executor();
        Executor<? extends ContentBase> executor = context.getBean(executorClass);
        return executor.execute(injection);
    }
}
