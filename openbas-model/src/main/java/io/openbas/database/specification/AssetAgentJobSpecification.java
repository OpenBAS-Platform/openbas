package io.openbas.database.specification;

import io.openbas.database.model.AssetAgentJob;
import org.springframework.data.jpa.domain.Specification;

public class AssetAgentJobSpecification {

  public static Specification<AssetAgentJob> forEndpoint(String externalReference) {
    // TODO Add time limitation
    // TODO add cleanup
    return (root, query, cb) -> {
      return cb.equal(root.get("asset").get("externalReference"), externalReference);
    };
  }
}
