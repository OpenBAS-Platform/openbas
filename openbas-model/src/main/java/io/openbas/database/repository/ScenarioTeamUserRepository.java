package io.openbas.database.repository;

import io.openbas.database.model.ScenarioTeamUser;
import io.openbas.database.model.ScenarioTeamUserId;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScenarioTeamUserRepository
    extends CrudRepository<ScenarioTeamUser, ScenarioTeamUserId>,
        JpaSpecificationExecutor<ScenarioTeamUser> {

  @NotNull
  Optional<ScenarioTeamUser> findById(@NotNull final ScenarioTeamUserId id);

  @Modifying
  @Query(
      value = "delete from scenarios_teams_users i where i.user_id = :userId",
      nativeQuery = true)
  void deleteUserFromAllReferences(@Param("userId") final String userId);

  @Modifying
  @Query(
      value = "delete from scenarios_teams_users i where i.team_id = :teamId",
      nativeQuery = true)
  void deleteTeamFromAllReferences(@Param("teamId") final String teamId);

  @Modifying
  @Query(
      value =
          "insert into scenarios_teams_users (exercise_id, team_id, user_id) "
              + "values (:exerciseId, :teamId, :userId)",
      nativeQuery = true)
  void addExerciseTeamUser(
      @Param("exerciseId") final String exerciseId,
      @Param("teamId") final String teamId,
      @Param("userId") final String userId);
}
