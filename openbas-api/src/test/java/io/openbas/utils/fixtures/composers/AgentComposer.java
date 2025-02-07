package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Agent;
import io.openbas.database.repository.AgentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AgentComposer extends ComposerBase<Agent> {
  @Autowired private AgentRepository agentRepository;

  public class Composer extends InnerComposerBase<Agent> {
    private final Agent agent;

    public Composer(Agent agent) {
      this.agent = agent;
    }

    @Override
    public AgentComposer.Composer persist() {
      agentRepository.save(agent);
      return this;
    }

    @Override
    public AgentComposer.Composer delete() {
      agentRepository.delete(agent);
      return this;
    }

    @Override
    public Agent get() {
      return this.agent;
    }
  }

  public AgentComposer.Composer forAgent(Agent agent) {
    generatedItems.add(agent);
    return new AgentComposer.Composer(agent);
  }
}
