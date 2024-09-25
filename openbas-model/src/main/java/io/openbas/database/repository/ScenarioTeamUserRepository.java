package io.openbas.database.repository;

import io.openbas.database.model.ScenarioTeamUser;
import io.openbas.database.model.ScenarioTeamUserId;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface ScenarioTeamUserRepository extends CrudRepository<ScenarioTeamUser, ScenarioTeamUserId>, JpaSpecificationExecutor<ScenarioTeamUser> {

    @NotNull
    Optional<ScenarioTeamUser> findById(@NotNull final ScenarioTeamUserId id);

    @Modifying
    @Query(value = "delete from scenarios_teams_users i where i.team_id = :teamId", nativeQuery = true)
    @Transactional
    void deleteTeamFromAllReferences(@Param("teamId") final String teamId);

}
