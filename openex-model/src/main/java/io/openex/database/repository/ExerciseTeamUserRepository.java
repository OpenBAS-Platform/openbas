package io.openex.database.repository;

import io.openex.database.model.ExerciseTeamUser;
import io.openex.database.model.ExerciseTeamUserId;
import io.openex.database.model.InjectDocument;
import io.openex.database.model.InjectDocumentId;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.validation.constraints.NotNull;
import java.util.Optional;

@Repository
public interface ExerciseTeamUserRepository extends CrudRepository<ExerciseTeamUser, ExerciseTeamUserId>, JpaSpecificationExecutor<ExerciseTeamUser> {

    @NotNull
    Optional<ExerciseTeamUser> findById(@NotNull ExerciseTeamUserId id);

    @Modifying
    @Query(value = "delete from exercises_teams_users i where i.user_id = :userId", nativeQuery = true)
    void deleteUserFromAllReferences(@Param("userId") String userId);

    @Modifying
    @Query(value = "delete from exercises_teams_users i where i.team_id = :teamId", nativeQuery = true)
    void deleteTeamFromAllReferences(@Param("teamId") String teamId);

    @Modifying
    @Query(value = "insert into exercises_teams_users (exercise_id, team_id, user_id) " +
            "values (:exerciseId, :teamId, :userId)", nativeQuery = true)
    void addExerciseTeamUser(@Param("exerciseId") String exerciseId,
                      @Param("teamId") String teamId,
                      @Param("userId") String userId);
}
