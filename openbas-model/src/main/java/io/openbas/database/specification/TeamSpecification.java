package io.openbas.database.specification;

import io.openbas.database.model.Team;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class TeamSpecification {

  public static Specification<Team> teamsAccessibleFromOrganizations(List<String> organizationIds) {
    return (root, query, builder) -> builder.or(
        builder.isNull(root.get("organization")),
        root.get("organization").get("id").in(organizationIds)
    );
  }

  public static Specification<Team> contextual(final boolean contextual) {
    if (contextual) {
      return (root, query, builder) -> builder.isTrue(root.get("contextual"));
    }
    return (root, query, builder) -> builder.isFalse(root.get("contextual"));
  }

}
