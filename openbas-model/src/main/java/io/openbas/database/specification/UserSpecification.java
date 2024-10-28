package io.openbas.database.specification;

import io.openbas.database.model.User;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

  public static Specification<User> accessibleFromOrganizations(List<String> organizationIds) {
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.or(
            criteriaBuilder.isNull(root.get("organization")),
            root.get("organization").get("id").in(organizationIds));
  }
}
