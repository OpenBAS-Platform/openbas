package io.openbas.database.specification;

import io.openbas.database.model.Role;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.domain.Specification;

public class RoleSpecification {

  public static Specification<Role> fromName(@NotBlank final String name) {
    return (root, query, cb) -> cb.equal(root.get("name"), name);
  }
}
