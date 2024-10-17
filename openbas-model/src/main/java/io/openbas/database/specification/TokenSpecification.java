package io.openbas.database.specification;

import io.openbas.database.model.Token;
import org.springframework.data.jpa.domain.Specification;

public class TokenSpecification {

  public static Specification<Token> fromUser(String userId) {
    return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
  }
}
