package io.openbas.database.repository;

import io.openbas.database.model.Team;
import io.openbas.database.raw.RawTeam;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends CrudRepository<Team, String>,
    StatisticRepository,
    JpaSpecificationExecutor<Team> {

  @NotNull
  Optional<Team> findById(@NotNull String id);

  Optional<Team> findByName(String name);

  List<Team> findByNameIgnoreCase(String name);

  @Query("select team from Team team where team.organization is null or team.organization.id in :organizationIds")
  List<Team> teamsAccessibleFromOrganizations(@Param("organizationIds") List<String> organizationIds);

  @Override
  @Query("select count(distinct u) from User u " +
      "join u.teams as team " +
      "where u.id = :userId and u.createdAt < :creationDate")
  long userCount(String userId, Instant creationDate);

  @Override
  @Query("select count(distinct t) from Team t where t.createdAt < :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  @Query(value="SELECT team_id, team_name " +
          "FROM teams " +
          "WHERE team_id IN :ids ;", nativeQuery = true)
  List<RawTeam> rawTeamByIds(@Param("ids") List<String> ids);

}
