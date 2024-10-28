package io.openbas.database.repository;

import io.openbas.database.model.Organization;
import io.openbas.database.raw.RawOrganization;
import java.util.List;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository
    extends CrudRepository<Organization, String>, JpaSpecificationExecutor<Organization> {

  @NotNull
  Optional<Organization> findById(@NotNull String id);

  @NotNull
  List<Organization> findByNameIgnoreCase(@NotNull final String name);

  @Query(
      value =
          "SELECT org.*, "
              + "array_agg(DISTINCT org_tags.tag_id) FILTER (WHERE org_tags.tag_id IS NOT NULL) AS organization_tags, "
              + "array_agg(DISTINCT injects.inject_id) FILTER (WHERE injects.inject_id IS NOT NULL) AS organization_injects, "
              + "coalesce(array_length(array_agg(DISTINCT injects.inject_id) FILTER (WHERE injects.inject_id IS NOT NULL), 1), 0) AS organization_injects_number "
              + "FROM organizations org "
              + "LEFT JOIN organizations_tags org_tags ON org.organization_id = org_tags.organization_id "
              + "LEFT JOIN users ON users.user_organization = org.organization_id "
              + "LEFT JOIN users_teams ON users.user_id = users_teams.user_id "
              + "LEFT JOIN injects_teams ON injects_teams.team_id = users_teams.team_id "
              + "LEFT JOIN injects ON injects.inject_id = injects_teams.inject_id OR injects.inject_all_teams "
              + "GROUP BY org.organization_id",
      nativeQuery = true)
  List<RawOrganization> rawAll();

  @Query(
      value =
          "SELECT org.*,"
              + "array_agg(DISTINCT org_tags.tag_id) FILTER (WHERE org_tags.tag_id IS NOT NULL) AS organization_tags, "
              + "array_agg(DISTINCT injects.inject_id) FILTER (WHERE injects.inject_id IS NOT NULL) AS organization_injects, "
              + "coalesce(array_length(array_agg(DISTINCT injects.inject_id) FILTER (WHERE injects.inject_id IS NOT NULL), 1), 0) AS organization_injects_number "
              + "FROM users "
              + "LEFT JOIN injects ON injects.inject_user = users.user_id OR injects.inject_all_teams "
              + "LEFT JOIN users_groups ug ON ug.user_id = users.user_id "
              + "LEFT JOIN groups ON ug.group_id = groups.group_id "
              + "LEFT JOIN groups_organizations go ON go.group_id = groups.group_id "
              + "INNER JOIN organizations org ON go.organization_id = org.organization_id "
              + "LEFT JOIN organizations_tags org_tags ON org.organization_id = org_tags.organization_id "
              + "WHERE users.user_id = :userId "
              + "GROUP BY org.organization_id",
      nativeQuery = true)
  List<RawOrganization> rawByUser(@Param("userId") String id);
}
