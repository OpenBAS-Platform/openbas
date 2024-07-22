package io.openbas.database.repository;

import io.openbas.database.model.Inject;
import io.openbas.database.raw.RawInject;
import java.util.Collection;
import java.util.Set;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface InjectRepository extends CrudRepository<Inject, String>, JpaSpecificationExecutor<Inject>,
    StatisticRepository {

  @NotNull
  Optional<Inject> findById(@NotNull String id);

  List<Inject> findByExerciseId(@NotNull String exerciseId);

  List<Inject> findByScenarioId(@NotNull String scenarioId);

  @NotNull
  Optional<Inject> findWithStatusById(@NotNull String id);

  @Query(value = "select i.* from injects i where i.inject_injector_contract = '49229430-b5b5-431f-ba5b-f36f599b0233'" +
      " and i.inject_content like :challengeId", nativeQuery = true)
  List<Inject> findAllForChallengeId(@Param("challengeId") String challengeId);

  @Query(value = "select i from Inject i " +
      "join i.documents as doc_rel " +
      "join doc_rel.document as doc " +
      "where doc.id = :documentId and i.exercise.id = :exerciseId")
  List<Inject> findAllForExerciseAndDoc(@Param("exerciseId") String exerciseId, @Param("documentId") String documentId);

  @Query(value = "select i from Inject i " +
      "join i.documents as doc_rel " +
      "join doc_rel.document as doc " +
      "where doc.id = :documentId and i.scenario.id = :scenarioId")
  List<Inject> findAllForScenarioAndDoc(@Param("scenarioId") String scenarioId, @Param("documentId") String documentId);

  @Modifying
  @Query(value = "insert into injects (inject_id, inject_title, inject_description, inject_country, inject_city," +
      "inject_injector_contract, inject_all_teams, inject_enabled, inject_exercise, inject_depends_from_another, " +
      "inject_depends_duration, inject_content) " +
      "values (:id, :title, :description, :country, :city, :contract, :allTeams, :enabled, :exercise, :dependsOn, :dependsDuration, :content)", nativeQuery = true)
  void importSaveForExercise(@Param("id") String id,
      @Param("title") String title,
      @Param("description") String description,
      @Param("country") String country,
      @Param("city") String city,
      @Param("contract") String contract,
      @Param("allTeams") boolean allTeams,
      @Param("enabled") boolean enabled,
      @Param("exercise") String exerciseId,
      @Param("dependsOn") String dependsOn,
      @Param("dependsDuration") Long dependsDuration,
      @Param("content") String content);

  @Modifying
  @Query(value = "insert into injects (inject_id, inject_title, inject_description, inject_country, inject_city," +
      "inject_injector_contract, inject_all_teams, inject_enabled, inject_scenario, inject_depends_from_another, " +
      "inject_depends_duration, inject_content) " +
      "values (:id, :title, :description, :country, :city, :contract, :allTeams, :enabled, :scenario, :dependsOn, :dependsDuration, :content)", nativeQuery = true)
  void importSaveForScenario(@Param("id") String id,
      @Param("title") String title,
      @Param("description") String description,
      @Param("country") String country,
      @Param("city") String city,
      @Param("contract") String contract,
      @Param("allTeams") boolean allTeams,
      @Param("enabled") boolean enabled,
      @Param("scenario") String scenarioId,
      @Param("dependsOn") String dependsOn,
      @Param("dependsDuration") Long dependsDuration,
      @Param("content") String content);

  @Modifying
  @Query(value = "insert into injects_tags (inject_id, tag_id) values (:injectId, :tagId)", nativeQuery = true)
  void addTag(@Param("injectId") String injectId, @Param("tagId") String tagId);

  @Modifying
  @Query(value = "insert into injects_teams (inject_id, team_id) values (:injectId, :teamId)", nativeQuery = true)
  void addTeam(@Param("injectId") String injectId, @Param("teamId") String teamId);

  @Override
  @Query("select count(distinct i) from Inject i " +
      "join i.exercise as e " +
      "join e.grants as grant " +
      "join grant.group.users as user " +
      "where user.id = :userId and i.createdAt < :creationDate")
  long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

  @Override
  @Query("select count(distinct i) from Inject i where i.createdAt < :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  @Query(value = " SELECT injects.inject_id, ins.status_name, injects.inject_scenario, " +
          "coalesce(array_agg(it.team_id) FILTER ( WHERE it.team_id IS NOT NULL ), '{}') as inject_teams, " +
          "coalesce(array_agg(assets.asset_id) FILTER ( WHERE assets.asset_id IS NOT NULL ), '{}') as inject_assets, " +
          "coalesce(array_agg(iag.asset_group_id) FILTER ( WHERE iag.asset_group_id IS NOT NULL ), '{}') as inject_asset_groups, " +
          "coalesce(array_agg(ie.inject_expectation_id) FILTER ( WHERE ie.inject_expectation_id IS NOT NULL ), '{}') as inject_expectations, " +
          "coalesce(array_agg(com.communication_id) FILTER ( WHERE com.communication_id IS NOT NULL ), '{}') as inject_communications, " +
          "coalesce(array_agg(apkcp.phase_id) FILTER ( WHERE apkcp.phase_id IS NOT NULL ), '{}') as inject_kill_chain_phases, " +
          "coalesce(array_union_agg(injcon.injector_contract_platforms) FILTER ( WHERE injcon.injector_contract_platforms IS NOT NULL ), '{}') as inject_platforms " +
          "FROM injects " +
          "LEFT JOIN injects_teams it ON injects.inject_id = it.inject_id " +
          "LEFT JOIN injects_assets ia ON injects.inject_id = ia.inject_id " +
          "LEFT JOIN injects_asset_groups iag ON injects.inject_id = iag.inject_id " +
          "LEFT JOIN asset_groups_assets aga ON aga.asset_group_id = iag.asset_group_id " +
          "LEFT JOIN assets ON assets.asset_id = ia.asset_id OR aga.asset_id = assets.asset_id " +
          "LEFT JOIN communications com ON com.communication_inject = injects.inject_id " +
          "LEFT JOIN injects_expectations ie ON injects.inject_id = ie.inject_id " +
          "LEFT JOIN injectors_contracts_attack_patterns icap ON icap.injector_contract_id = injects.inject_injector_contract " +
          "LEFT JOIN injectors_contracts injcon ON injcon.injector_contract_id = injects.inject_injector_contract " +
          "LEFT JOIN attack_patterns_kill_chain_phases apkcp ON apkcp.attack_pattern_id = icap.attack_pattern_id " +
          "LEFT JOIN injects_statuses ins ON ins.status_inject = injects.inject_id " +
          "WHERE injects.inject_id IN :ids " +
          "GROUP BY injects.inject_id, ins.status_name;", nativeQuery = true)
  List<RawInject> findRawByIds(@Param("ids")List<String> ids);

  @Query(value = " SELECT injects.inject_id, " +
      "coalesce(array_agg(it.team_id) FILTER ( WHERE it.team_id IS NOT NULL ), '{}') as inject_teams " +
      "FROM injects " +
      "LEFT JOIN injects_teams it ON injects.inject_id = it.inject_id " +
      "WHERE injects.inject_id IN :ids AND it.team_id = :teamId " +
      "GROUP BY injects.inject_id", nativeQuery = true)
  Set<RawInject> findRawInjectTeams(@Param("ids") Collection<String> ids, @Param("teamId")  String teamId);

  @Query(value =
      "SELECT org.*, " +
          "array_agg(DISTINCT org_tags.tag_id) FILTER (WHERE org_tags.tag_id IS NOT NULL) AS organization_tags, " +
          "array_agg(DISTINCT injects.inject_id) FILTER (WHERE injects.inject_id IS NOT NULL) AS organization_injects, " +
          "coalesce(array_length(array_agg(DISTINCT injects.inject_id) FILTER (WHERE injects.inject_id IS NOT NULL), 1), 0) AS organization_injects_number " +
          "FROM organizations org " +
          "LEFT JOIN organizations_tags org_tags ON org.organization_id = org_tags.organization_id " +
          "LEFT JOIN users ON users.user_organization = org.organization_id " +
          "LEFT JOIN users_teams ON users.user_id = users_teams.user_id " +
          "LEFT JOIN injects_teams ON injects_teams.team_id = users_teams.team_id " +
          "LEFT JOIN injects ON injects.inject_id = injects_teams.inject_id OR injects.inject_all_teams " +
          "GROUP BY org.organization_id",
      nativeQuery = true)
  List<RawInject> rawAll();
}
