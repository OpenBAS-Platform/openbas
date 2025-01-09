package io.openbas.utils.fixtures;

import io.openbas.database.model.Agent;
import io.openbas.database.model.AssetAgentJob;

public class AssetAgentJobFixture {

  public static AssetAgentJob createDefaultAssetAgentJob(Agent agent) {
    AssetAgentJob assetAgentJob = new AssetAgentJob();
    assetAgentJob.setCommand("whoami");
    assetAgentJob.setAgent(agent);
    return assetAgentJob;
  }
}
