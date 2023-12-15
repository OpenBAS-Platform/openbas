package io.openex.helper;

import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.TeamRepository;
import io.openex.database.repository.DryInjectRepository;
import io.openex.database.repository.InjectRepository;
import io.openex.database.specification.DryInjectSpecification;
import io.openex.database.specification.InjectSpecification;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.service.ContractService;
import io.openex.service.ExecutionContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.util.function.Tuple2;
import reactor.util.function.Tuples;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.helper.StreamHelper.fromIterable;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Stream.concat;

@Component
public class InjectHelper {

    private InjectRepository injectRepository;
    private DryInjectRepository dryInjectRepository;
    private TeamRepository teamRepository;
    private ContractService contractService;
    private ExecutionContextService executionContextService;

    @Autowired
    public void setContractService(ContractService contractService) {
        this.contractService = contractService;
    }

    @Autowired
    public void setTeamRepository(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
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
    public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
        this.executionContextService = executionContextService;
    }

    private List<Team> getInjectTeams(Inject inject) {
        Exercise exercise = inject.getExercise();
        return inject.isAllTeams() ? exercise.getTeams() : inject.getTeams();
    }

    private Stream<Tuple2<User, String>> getUsersFromInjection(Injection injection) {
        if (injection instanceof DryInject dryInject) {
            return dryInject.getRun().getUsers().stream()
                    .map(user -> Tuples.of(user, "Dryrun"));
        } else if (injection instanceof Inject inject) {
            List<Team> teams = getInjectTeams(inject);
            // We get all the teams for this inject
            // But those team can be used in other exercises with different players enabled
            // So we need to focus on team players only enabled in the context of the current exercise
            return teams.stream().flatMap(team ->
                    team.getExerciseTeamUsers().stream()
                            .filter(exerciseTeamUser -> exerciseTeamUser.getExercise().getId().equals(injection.getExercise().getId()))
                            .map(exerciseTeamUser -> Tuples.of(exerciseTeamUser.getUser(), team.getName()))
            );
        }
        throw new UnsupportedOperationException("Unsupported type of Injection");
    }

    private List<ExecutionContext> usersFromInjection(Injection injection) {
        return getUsersFromInjection(injection)
                .collect(groupingBy(Tuple2::getT1)).entrySet().stream()
                .map(entry -> this.executionContextService.executionContext(entry.getKey(), injection,
                        entry.getValue().stream().flatMap(ua -> Stream.of(ua.getT2())).toList()))
                .toList();
    }

    private boolean isBeforeOrEqualsNow(Injection injection) {
        Instant now = Instant.now();
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.equals(now) || injectWhen.isBefore(now);
    }

    @Transactional
    public List<ExecutableInject> getInjectsToRun() {
        // Get injects
        List<Inject> injects = this.injectRepository.findAll(InjectSpecification.executable());
        Stream<ExecutableInject> executableInjects = injects.stream()
                .filter(this::isBeforeOrEqualsNow)
                .sorted(Inject.executionComparator)
                .map(inject -> {
                    Contract contract = this.contractService.resolveContract(inject);
                    List<Team> teams = getInjectTeams(inject);
                    return new ExecutableInject(true, false, inject, contract, teams, usersFromInjection(inject));
                });
        // Get dry injects
        List<DryInject> dryInjects = this.dryInjectRepository.findAll(DryInjectSpecification.executable());
        Stream<ExecutableInject> executableDryInjects = dryInjects.stream()
                .filter(this::isBeforeOrEqualsNow)
                .sorted(DryInject.executionComparator)
                .map(dry -> {
                    Inject inject = dry.getInject();
                    Contract contract = this.contractService.resolveContract(inject);
                    List<Team> teams = new ArrayList<>(); // No teams in dry run, only direct users
                    return new ExecutableInject(false, false, dry, inject, contract, teams, usersFromInjection(dry));
                });
        // Combine injects and dry
        return concat(executableInjects, executableDryInjects)
                .filter(
                        executableInject -> executableInject.getContract() == null || !executableInject.getContract().isManual()
                )
                .collect(Collectors.toList());
    }
}
