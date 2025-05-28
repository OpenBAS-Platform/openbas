package io.openbas.rest.inject.output;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Asset;
import java.util.Set;
import org.jetbrains.annotations.NotNull;

public record AgentsAndAssetsAgentless(
    @NotNull Set<Agent> agents, @NotNull Set<Asset> assetsAgentless) {}
