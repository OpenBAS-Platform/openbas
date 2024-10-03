package io.openbas.database.repository;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.raw.RawInjectExpectationForCompute;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InjectExpectationRepository extends CrudRepository<InjectExpectation, String>,
    JpaSpecificationExecutor<InjectExpectation> {

  @NotNull
  Optional<InjectExpectation> findById(@NotNull String id);

  @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId")
  List<InjectExpectation> findAllForExercise(@Param("exerciseId") String exerciseId);

  @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId and i.inject.id = :injectId")
  List<InjectExpectation> findAllForExerciseAndInject(
      @Param("exerciseId") @NotBlank final String exerciseId,
      @Param("injectId") @NotBlank final String injectId
  );

  @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId " +
      "and i.type = 'CHALLENGE' and i.user.id = :userId ")
  List<InjectExpectation> findChallengeExpectationsByExerciseAndUser(@Param("exerciseId") String exerciseId,
      @Param("userId") String userId);

  @Query(value = "select i from InjectExpectation i where i.exercise.id = :exerciseId " +
      "and i.type = 'CHALLENGE' and i.challenge.id = :challengeId and i.team.id in (:teamIds)")
  List<InjectExpectation> findChallengeExpectations(@Param("exerciseId") String exerciseId,
      @Param("teamIds") List<String> teamIds,
      @Param("challengeId") String challengeId);

  @Query(value = "select i from InjectExpectation i where i.user.id = :userId and i.exercise.id = :exerciseId " +
      "and i.challenge.id = :challengeId and i.type = 'CHALLENGE' ")
  List<InjectExpectation> findByUserAndExerciseAndChallenge(@Param("userId") String userId,
      @Param("exerciseId") String exerciseId,
      @Param("challengeId") String challengeId);

  @Query(value = "select i from InjectExpectation i where i.inject.id in (:injectIds) " +
      "and i.article.id in (:articlesIds) and i.team.id in (:teamIds) and i.type = 'ARTICLE'")
  List<InjectExpectation> findChannelExpectations(@Param("injectIds") List<String> injectIds,
      @Param("teamIds") List<String> teamIds,
      @Param("articlesIds") List<String> articlesIds);
  // -- PREVENTION --

  @Query(value = "select i from InjectExpectation i where i.type = 'PREVENTION' and i.inject.id = :injectId and i.asset.id = :assetId")
  InjectExpectation findPreventionExpectationForAsset(@Param("injectId") String injectId,
      @Param("assetId") String assetId);

  @Query(value = "select i from InjectExpectation i where i.type = 'PREVENTION' and i.inject.id = :injectId and i.assetGroup.id = :assetGroupId")
  InjectExpectation findPreventionExpectationForAssetGroup(@Param("injectId") String injectId,
      @Param("assetGroupId") String assetGroupId);

  // -- BY TARGET TYPE

  @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.team.id = :teamId and i.user.id = :playerId")
  List<InjectExpectation> findAllByInjectAndTeamAndPlayer(
      @Param("injectId") @NotBlank final String injectId,
      @Param("teamId") @NotBlank final String teamId,
      @Param("playerId") @NotBlank final String playerId
  );

  @Query("select ie from InjectExpectation ie " +
      "where ie.inject.id = :injectId " +
      "and ie.team.id = :teamId " +
      "and ie.name = :expectationName ")
  List<InjectExpectation> findAllByInjectAndTeamAndExpectationName(final String injectId, final String teamId,
      final String expectationName);

  @Query("select ie from InjectExpectation ie " +
      "where ie.inject.id = :injectId " +
      "and ie.team.id = :teamId " +
      "and ie.name = :expectationName " +
      "and ie.user is not null")
  List<InjectExpectation> findAllByInjectAndTeamAndExpectationNameAndUserIsNotNull(final String injectId,
      final String teamId, final String expectationName);

  // -- RETRIEVE EXPECTATIONS FOR TEAM AND NOT FOR PLAYERS
  @Query("select ie from InjectExpectation ie where ie.inject.id = :injectId and ie.team.id = :teamId and ie.name = :expectationName and ie.user is null")
  Optional<InjectExpectation> findByInjectAndTeamAndExpectationNameAndUserIsNull(String injectId, String teamId,
      String expectationName);

  @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.team.id = :teamId and i.user is null")
  List<InjectExpectation> findAllByInjectAndTeam(
      @Param("injectId") @NotBlank final String injectId,
      @Param("teamId") @NotBlank final String teamId
  );

  @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.asset.id = :assetId")
  List<InjectExpectation> findAllByInjectAndAsset(
      @Param("injectId") @NotBlank final String injectId,
      @Param("assetId") @NotBlank final String assetId
  );

  @Query(value = "select i from InjectExpectation i where i.inject.id = :injectId and i.assetGroup.id = :assetGroupId")
  List<InjectExpectation> findAllByInjectAndAssetGroup(
      @Param("injectId") @NotBlank final String injectId,
      @Param("assetGroupId") @NotBlank final String assetGroupId
  );

  @Query(value = "SELECT "
      + "team_id, asset_id, asset_group_id, inject_expectation_type, "
      + "inject_expectation_score, inject_expectation_group, inject_expectation_expected_score, inject_expectation_id, exercise_id "
      + "FROM injects_expectations i "
      + "where i.inject_expectation_id IN :ids",
      nativeQuery = true)
  List<RawInjectExpectation> rawByIds(@Param("ids") final List<String> ids);

  @Query(value = "SELECT "
      + "inject_expectation_type, inject_expectation_score, inject_expectation_expected_score, user_id, team_id "
      + "FROM injects_expectations i "
      + "WHERE i.inject_expectation_id IN :ids "
      + "AND i.user_id is null",
      nativeQuery = true)
  List<RawInjectExpectationForCompute> rawForComputeGlobalByIds(@Param("ids") final List<String> ids);

  @Query(value = "SELECT "
  + "i.inject_expectation_id AS inject_expectation_id, "
  + "t.team_id AS team_id, "
  + "t.team_name AS team_name, "
  + "a.asset_id AS asset_id, "
  + "a.asset_name AS asset_name, "
  + "a.asset_type AS asset_type, "
  + "a.endpoint_platform AS endpoint_platform, "
  + "at.asset_group_id AS asset_group_id, "
  + "at.asset_group_name AS asset_group_name, "
  + "COALESCE(ARRAY_AGG(aga.asset_id) FILTER (WHERE aga.asset_id IS NOT NULL),'{}') AS asset_ids, "
  + "i.inject_expectation_type AS inject_expectation_type, "
  + "u.user_id AS user_id, "
  + "i.inject_expectation_score AS inject_expectation_score, "
  + "i.inject_expectation_expected_score AS inject_expectation_expected_score, "
  + "i.inject_expectation_group AS inject_expectation_group "
  + "FROM injects_expectations i "
  + "LEFT JOIN teams t ON t.team_id = i.team_id "
  + "LEFT JOIN assets a ON a.asset_id = i.asset_id "
  + "LEFT JOIN asset_groups at ON at.asset_group_id = i.asset_group_id "
  + "LEFT JOIN asset_groups_assets aga ON aga.asset_group_id = at.asset_group_id "
  + "LEFT JOIN users u ON u.user_id = i.user_id "
  + "WHERE i.inject_id = :injectId "
  + "GROUP BY "
  + "i.inject_expectation_id, "
  + "t.team_id, "
  + "t.team_name, "
  + "a.asset_id, "
  + "a.asset_name, "
  + "at.asset_group_id, "
  + "at.asset_group_name, "
  + "u.user_id, "
  + "i.inject_expectation_type, "
  + "i.inject_expectation_score, "
  + "i.inject_expectation_expected_score, "
  + "i.inject_expectation_group ; ", nativeQuery = true)
  List<RawInjectExpectationForCompute> rawByInjectId(@Param("injectId") final String injectId);


}
