package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.raw.RawInjectExpectation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectExpectationRepository
    extends CrudRepository<InjectExpectation, String>, JpaSpecificationExecutor<InjectExpectation> {

  @NotNull
  Optional<InjectExpectation> findById(@NotNull String id);

  @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId")
  List<InjectExpectation> findAllForExercise(@Param("exerciseId") String exerciseId);

  @Query(
      value =
          "select i from InjectExpectation i where i.exercise.id = :exerciseId and i.inject.id = :injectId")
  List<InjectExpectation> findAllForExerciseAndInject(
      @Param("exerciseId") @NotBlank final String exerciseId,
      @Param("injectId") @NotBlank final String injectId);

  @Query(
      value =
          "select i from InjectExpectation i where i.exercise.id = :exerciseId "
              + "and i.type = 'CHALLENGE' and i.user.id = :userId ")
  List<InjectExpectation> findChallengeExpectationsByExerciseAndUser(
      @Param("exerciseId") String exerciseId, @Param("userId") String userId);

  @Query(
      value =
          "select i from InjectExpectation i where i.exercise.id = :exerciseId "
              + "and i.type = 'CHALLENGE' and i.challenge.id = :challengeId and i.team.id in (:teamIds)")
  List<InjectExpectation> findChallengeExpectations(
      @Param("exerciseId") String exerciseId,
      @Param("teamIds") List<String> teamIds,
      @Param("challengeId") String challengeId);

  @Query(
      value =
          "select i from InjectExpectation i where i.user.id = :userId and i.exercise.id = :exerciseId "
              + "and i.challenge.id = :challengeId and i.type = 'CHALLENGE' ")
  List<InjectExpectation> findByUserAndExerciseAndChallenge(
      @Param("userId") String userId,
      @Param("exerciseId") String exerciseId,
      @Param("challengeId") String challengeId);

  @Query(
      value =
          "select i from InjectExpectation i where i.inject.id in (:injectIds) "
              + "and i.article.id in (:articlesIds) and i.team.id in (:teamIds) and i.type = 'ARTICLE'")
  List<InjectExpectation> findChannelExpectations(
      @Param("injectIds") List<String> injectIds,
      @Param("teamIds") List<String> teamIds,
      @Param("articlesIds") List<String> articlesIds);

  // -- BY TARGET TYPE

  @Query(
      value =
          "select i from InjectExpectation i where i.inject.id = :injectId and i.team.id = :teamId and i.user.id = :playerId")
  List<InjectExpectation> findAllByInjectAndTeamAndPlayer(
      @Param("injectId") @NotBlank final String injectId,
      @Param("teamId") @NotBlank final String teamId,
      @Param("playerId") @NotBlank final String playerId);

  @Query(
      "select ie from InjectExpectation ie "
          + "where ie.inject.id = :injectId "
          + "and ie.team.id = :teamId "
          + "and ie.name = :expectationName ")
  List<InjectExpectation> findAllByInjectAndTeamAndExpectationName(
      final String injectId, final String teamId, final String expectationName);

  @Query(
      "select ie from InjectExpectation ie "
          + "where ie.inject.id = :injectId "
          + "and ie.team.id = :teamId "
          + "and ie.name = :expectationName "
          + "and ie.user is not null")
  List<InjectExpectation> findAllByInjectAndTeamAndExpectationNameAndUserIsNotNull(
      final String injectId, final String teamId, final String expectationName);

  // -- RETRIEVE EXPECTATIONS FOR TEAM AND NOT FOR PLAYERS
  @Query(
      value =
          "select i from InjectExpectation i where i.inject.id = :injectId and i.team.id = :teamId and i.user is null")
  List<InjectExpectation> findAllByInjectAndTeam(
      @Param("injectId") @NotBlank final String injectId,
      @Param("teamId") @NotBlank final String teamId);

  @Query(
      value =
          "select i from InjectExpectation i where i.inject.id = :injectId and i.agent.id = :agentId")
  List<InjectExpectation> findAllByInjectAndAgent(
      @Param("injectId") @NotBlank final String injectId,
      @Param("agentId") @NotBlank final String agentId);

  @Query(
      value =
          "select i from InjectExpectation i where i.inject.id = :injectId and i.asset.id = :assetId and i.agent is null")
  List<InjectExpectation> findAllByInjectAndAsset(
      @Param("injectId") @NotBlank final String injectId,
      @Param("assetId") @NotBlank final String assetId);

  @Query(
      value =
          "select i from InjectExpectation i where i.inject.id = :injectId and i.assetGroup.id = :assetGroupId and i.asset is null and i.agent is null")
  List<InjectExpectation> findAllByInjectAndAssetGroup(
      @Param("injectId") @NotBlank final String injectId,
      @Param("assetGroupId") @NotBlank final String assetGroupId);

  @Query(
      value =
          "SELECT "
              + "i.inject_expectation_id AS inject_expectation_id, "
              + "i.inject_id AS inject_id, "
              + "i.exercise_id AS exercise_id, "
              + "i.team_id AS team_id, "
              + "i.agent_id AS agent_id, "
              + "i.asset_id AS asset_id, "
              + "i.asset_group_id AS asset_group_id, "
              + "i.inject_expectation_type AS inject_expectation_type, "
              + "i.user_id AS user_id, "
              + "i.inject_expectation_score AS inject_expectation_score, "
              + "i.inject_expectation_expected_score AS inject_expectation_expected_score, "
              + "i.inject_expectation_group AS inject_expectation_group "
              + "FROM injects_expectations i "
              + "WHERE i.inject_id IN (:injectIds) ; ",
      nativeQuery = true)
  Set<RawInjectExpectation> rawByInjectIds(@Param("injectIds") final Set<String> injectIds);

  @Query(
      value =
          "SELECT "
              + "i.inject_expectation_id AS inject_expectation_id, "
              + "i.inject_id AS inject_id, "
              + "i.exercise_id AS exercise_id, "
              + "i.team_id AS team_id, "
              + "i.agent_id AS agent_id, "
              + "i.asset_id AS asset_id, "
              + "i.asset_group_id AS asset_group_id, "
              + "i.inject_expectation_type AS inject_expectation_type, "
              + "i.user_id AS user_id, "
              + "i.inject_expectation_score AS inject_expectation_score, "
              + "i.inject_expectation_expected_score AS inject_expectation_expected_score, "
              + "i.inject_expectation_group AS inject_expectation_group "
              + "FROM injects_expectations i "
              + "WHERE i.inject_id IN (:injectIds) "
              + "AND i.user_id is null "
              + "AND i.agent_id is null ;",
      nativeQuery = true)
  // We don't include expectations for players, only for the team, neither for agents, if applicable
  List<RawInjectExpectation> rawForComputeGlobalByInjectIds(
      @Param("injectIds") Set<String> injectIds);

  @Query(
      value =
          "SELECT "
              + "i.inject_expectation_id AS inject_expectation_id, "
              + "i.inject_id AS inject_id, "
              + "i.exercise_id AS exercise_id, "
              + "i.team_id AS team_id, "
              + "i.agent_id AS agent_id, "
              + "i.asset_id AS asset_id, "
              + "i.asset_group_id AS asset_group_id, "
              + "i.inject_expectation_type AS inject_expectation_type, "
              + "i.user_id AS user_id, "
              + "i.inject_expectation_score AS inject_expectation_score, "
              + "i.inject_expectation_expected_score AS inject_expectation_expected_score, "
              + "i.inject_expectation_group AS inject_expectation_group "
              + "FROM injects_expectations i "
              + "WHERE i.exercise_id IN (:exerciseIds) "
              + "AND i.user_id is null "
              + "AND i.agent_id is null ;",
      nativeQuery = true)
  // We don't include expectations for players, only for the team, if applicable
  List<RawInjectExpectation> rawForComputeGlobalByExerciseIds(
      @Param("exerciseIds") Set<String> exerciseIds);
}
