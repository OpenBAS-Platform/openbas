package io.openex.database.repository;

import io.openex.database.model.Team;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends CrudRepository<Team, String>, JpaSpecificationExecutor<Team> {

    @NotNull
    Optional<Team> findById(@NotNull String id);

    List<Team> findByNameIgnoreCase(String name);

    @Query("select team from Team team where team.organization is null or team.organization.id in :organizationIds")
    List<Team> teamsAccessibleFromOrganizations(@Param("organizationIds") List<String> organizationIds);

    @Query("select team from Team team where team.contextual is true")
    List<Team> teamsNotContextual();
}
