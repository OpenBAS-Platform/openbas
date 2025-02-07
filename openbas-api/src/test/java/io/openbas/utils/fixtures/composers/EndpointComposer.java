package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.EndpointRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EndpointComposer extends ComposerBase<Endpoint> {
  @Autowired private EndpointRepository endpointRepository;

  public class Composer extends InnerComposerBase<Endpoint> {
    private final Endpoint endpoint;
    private final List<AgentComposer.Composer> agentComposers = new ArrayList<>();

    public Composer(Endpoint endpoint) {
      this.endpoint = endpoint;
    }

    public Composer withAgent(AgentComposer.Composer agentComposer) {
      agentComposers.add(agentComposer);
      List<Agent> agents = endpoint.getAgents();
      Agent newAgent = agentComposer.get();
      newAgent.setAsset(this.endpoint);
      agents.add(newAgent);
      this.endpoint.setAgents(agents);
      return this;
    }

    @Override
    public Composer persist() {
      endpointRepository.save(endpoint);
      return this;
    }

    @Override
    public Composer delete() {
      endpointRepository.delete(endpoint);
      return this;
    }

    @Override
    public Endpoint get() {
      return this.endpoint;
    }
  }

  public EndpointComposer.Composer forEndpoint(Endpoint endpoint) {
    generatedItems.add(endpoint);
    return new EndpointComposer.Composer(endpoint);
  }
}
