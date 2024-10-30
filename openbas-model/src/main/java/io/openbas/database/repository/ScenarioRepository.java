package io.openbas.database.repository;

import io.openbas.database.model.Scenario;
import io.openbas.database.raw.RawExerciseSimple;
import io.openbas.database.raw.RawScenario;
import java.time.Instant;
import java.util.List;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ScenarioRepository
    extends JpaRepository<Scenario, String>,
        StatisticRepository,
        JpaSpecificationExecutor<Scenario> {

  @Query(
      value =
          "SELECT ex.exercise_id, "
              + "ex.exercise_status, "
              + "ex.exercise_start_date, "
              + "ex.exercise_updated_at, "
              + "ex.exercise_end_date, "
              + "ex.exercise_name, "
              + "ex.exercise_category, "
              + "ex.exercise_subtitle, "
              + " array_agg(distinct ie.inject_id) FILTER ( WHERE ie.inject_id IS NOT NULL ) as inject_ids, "
              + " array_agg(distinct et.tag_id) FILTER ( WHERE et.tag_id IS NOT NULL ) as exercise_tags "
              + "FROM exercises ex "
              + "LEFT JOIN scenarios_exercises se ON se.exercise_id = ex.exercise_id "
              + "LEFT JOIN scenarios s ON se.scenario_id = s.scenario_id "
              + "LEFT JOIN exercises_tags et ON et.exercise_id = ex.exercise_id "
              + "LEFT JOIN injects_expectations ie ON ex.exercise_id = ie.exercise_id "
              + "WHERE s.scenario_external_reference = :externalReference "
              + "GROUP BY ex.exercise_id ;",
      nativeQuery = true)
  List<RawExerciseSimple> rawAllByExternalReference(
      @Param("externalReference") String externalReference);

  @Query(
      "select distinct s from Scenario s "
          + "join s.grants as grant "
          + "join grant.group.users as user "
          + "where user.id = :userId")
  List<Scenario> findAllGranted(@Param("userId") String userId);

  @Override
  @Query(
      "select count(distinct u) from User u "
          + "join u.teams as team "
          + "join team.scenarios as s "
          + "join s.grants as grant "
          + "join grant.group.users as user "
          + "where user.id = :userId and u.createdAt > :creationDate")
  long userCount(String userId, Instant creationDate);

  @Override
  @Query("select count(distinct s) from Scenario s where s.createdAt > :creationDate")
  long globalCount(@Param("creationDate") Instant creationDate);

  @Query(
      value =
          "SELECT scenario_category, COUNT(*) AS category_count "
              + "FROM scenarios "
              + "GROUP BY scenario_category "
              + "ORDER BY category_count DESC "
              + "LIMIT :limit",
      nativeQuery = true)
  List<Object[]> findTopCategories(@Param("limit") @NotNull final int limit);

  @Query(
      value =
          "SELECT sce.scenario_id, sce.scenario_name, sce.scenario_subtitle, array_agg(sct.tag_id) FILTER (WHERE sct.tag_id IS NOT NULL) as scenario_tags "
              + "FROM scenarios sce "
              + "LEFT JOIN scenarios_tags sct ON sct.scenario_id = sce.scenario_id "
              + "INNER join grants ON grants.grant_scenario = sce.scenario_id "
              + "INNER join groups ON grants.grant_group = groups.group_id "
              + "INNER JOIN users_groups ON groups.group_id = users_groups.group_id "
              + "WHERE users_groups.user_id = :userId "
              + "GROUP BY sce.scenario_id",
      nativeQuery = true)
  List<RawScenario> rawAllGranted(@Param("userId") String userId);

  @Query(
      value =
          "SELECT sce.scenario_id, sce.scenario_name, sce.scenario_subtitle, array_agg(sct.tag_id) FILTER (WHERE sct.tag_id IS NOT NULL) as scenario_tags "
              + "FROM scenarios sce "
              + "LEFT JOIN scenarios_tags sct ON sct.scenario_id = sce.scenario_id "
              + "GROUP BY sce.scenario_id",
      nativeQuery = true)
  List<RawScenario> rawAll();

  @Query(
      value =
          "SELECT sce.scenario_id, "
              + "coalesce(array_agg(inj.inject_id) FILTER (WHERE inj.inject_id IS NOT NULL), '{}') as scenario_injects "
              + "FROM scenarios sce "
              + "LEFT JOIN injects inj ON inj.inject_scenario = sce.scenario_id "
              + "WHERE sce.scenario_id IN :ids "
              + "GROUP BY sce.scenario_id",
      nativeQuery = true)
  List<RawScenario> rawInjectsFromScenarios(@Param("ids") List<String> ids);

  // -- CATEGORY --

  @Query(
      "SELECT DISTINCT s.category FROM Scenario s WHERE LOWER(s.category) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
  List<String> findDistinctCategoriesBySearchTerm(
      @Param("searchTerm") final String searchTerm, Pageable pageable);

  // -- PAGINATION --

  @NotNull
  @EntityGraph(value = "Scenario.tags-injects", type = EntityGraph.EntityGraphType.LOAD)
  Page<Scenario> findAll(@NotNull Specification<Scenario> spec, @NotNull Pageable pageable);

  // -- TEAM --

  @Modifying
  @Query(
      value =
          "DELETE FROM scenarios_teams st WHERE st.scenario_id = :scenarioId AND st.team_id in :teamIds",
      nativeQuery = true)
  @Transactional
  void removeTeams(
      @Param("scenarioId") final String scenarioId, @Param("teamIds") final List<String> teamIds);
}
