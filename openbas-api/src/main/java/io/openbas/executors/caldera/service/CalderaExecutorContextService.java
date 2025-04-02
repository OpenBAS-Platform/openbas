package io.openbas.executors.caldera.service;

import static io.openbas.executors.caldera.service.CalderaExecutorService.CALDERA_EXECUTOR_NAME;

import io.openbas.database.model.*;
import io.openbas.executors.ExecutorContextService;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.client.model.Ability;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.integrations.InjectorService;
import io.openbas.rest.exception.AgentException;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service(CALDERA_EXECUTOR_NAME)
@RequiredArgsConstructor
public class CalderaExecutorContextService extends ExecutorContextService {

  private final CalderaExecutorConfig calderaExecutorConfig;
  private final InjectorService injectorService;
  private final CalderaExecutorClient calderaExecutorClient;

  public final Map<String, Ability> injectorExecutorAbilities = new HashMap<>();
  public final Map<String, Ability> injectorExecutorClearAbilities = new HashMap<>();

  public void registerAbilities() {
    // Create the abilities if not exist for all injectors that need it
    List<Ability> abilities = this.abilities();

    Iterable<Injector> injectors = injectorService.injectors();
    injectors.forEach(
        injector -> {
          if (injector.getExecutorCommands() != null) {
            List<Ability> filteredAbilities =
                abilities.stream()
                    .filter(
                        ability ->
                            ability.getName().equals("caldera-subprocessor-" + injector.getName()))
                    .toList();
            if (!filteredAbilities.isEmpty()) {
              Ability existingAbility = filteredAbilities.getFirst();
              calderaExecutorClient.deleteAbility(existingAbility);
            }
            Ability ability = calderaExecutorClient.createSubprocessorAbility(injector);
            this.injectorExecutorAbilities.put(injector.getId(), ability);
          }
          if (injector.getExecutorClearCommands() != null) {
            List<Ability> filteredAbilities =
                abilities.stream()
                    .filter(
                        ability -> ability.getName().equals("caldera-clear-" + injector.getName()))
                    .toList();
            if (!filteredAbilities.isEmpty()) {
              Ability existingAbility = filteredAbilities.getFirst();
              calderaExecutorClient.deleteAbility(existingAbility);
            }
            Ability ability = calderaExecutorClient.createClearAbility(injector);
            this.injectorExecutorClearAbilities.put(injector.getId(), ability);
          }
        });
  }

  public void launchExecutorSubprocess(
      @NotNull final Inject inject,
      @NotNull final Endpoint assetEndpoint,
      @NotNull final Agent agent)
      throws AgentException {

    if (!this.calderaExecutorConfig.isEnable()) {
      throw new AgentException("Fatal error: Caldera executor is not enabled", agent);
    }

    inject
        .getInjectorContract()
        .map(InjectorContract::getInjector)
        .ifPresent(
            injector -> {
              if (this.injectorExecutorAbilities.containsKey(injector.getId())) {
                List<Map<String, String>> additionalFields =
                    List.of(
                        Map.of("trait", "inject", "value", inject.getId()),
                        Map.of("trait", "agent", "value", agent.getId()));
                calderaExecutorClient.exploit(
                    "base64",
                    agent.getExternalReference(),
                    this.injectorExecutorAbilities.get(injector.getId()).getAbility_id(),
                    additionalFields);
              }
            });
  }

  public void launchBatchExecutorSubprocess(
      Inject inject, List<Agent> agents, InjectStatus injectStatus) {}

  public void launchExecutorClear(@NotNull final Injector injector, @NotNull final Agent agent) {
    if (this.injectorExecutorAbilities.containsKey(injector.getId())) {
      calderaExecutorClient.exploit(
          "base64",
          agent.getExternalReference(),
          this.injectorExecutorClearAbilities.get(injector.getId()).getAbility_id(),
          List.of());
    }
  }

  private List<Ability> abilities() {
    return calderaExecutorClient.abilities();
  }
}
