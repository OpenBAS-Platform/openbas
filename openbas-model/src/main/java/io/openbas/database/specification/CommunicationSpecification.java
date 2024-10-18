package io.openbas.database.specification;

import io.openbas.database.model.Communication;
import org.springframework.data.jpa.domain.Specification;

public class CommunicationSpecification {

  public static Specification<Communication> fromInject(String injectId) {
    return (root, query, cb) -> cb.equal(root.get("inject").get("id"), injectId);
  }
}
