package io.openbas.utils.fixtures;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Asset;


public class AgentFixture {

  public static Agent createAgent(Asset asset, String externalReference) {
    Agent agent = new Agent();
    agent.setExecutedByUser(Agent.ADMIN_SYSTEM_WINDOWS);
    agent.setPrivilege(Agent.PRIVILEGE.admin);
    agent.setDeploymentMode(Agent.DEPLOYMENT_MODE.service);
    agent.setAsset(asset);
    agent.setExternalReference(externalReference);
    return agent;
  }
}
