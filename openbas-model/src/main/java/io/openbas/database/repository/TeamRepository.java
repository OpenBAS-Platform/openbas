package io.openbas.database.repository;

import io.openbas.database.model.Team;
import io.openbas.database.raw.RawTeam;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
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

  @NotNull
  Optional<Team> findByName(@NotNull final String name);

  @NotNull
  List<Team> findAllByNameIgnoreCase(@NotNull final String name);

  @Query("SELECT team FROM Team team where lower(team.name) = lower(:name) and team.contextual = false")
  List<Team> findByNameIgnoreCaseAndNotContextual(@NotNull final String name);

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

  @Query(value="SELECT teams.team_id, teams.team_name, teams.team_description, teams.team_created_at, teams.team_updated_at, teams.team_organization, " +
          "       team_contextual, " +
          "       coalesce(array_agg(DISTINCT teams_tags.tag_id) FILTER ( WHERE teams_tags.tag_id IS NOT NULL ), '{}') as team_tags, " +
          "       coalesce(array_agg(DISTINCT users_teams.user_id) FILTER ( WHERE users_teams.user_id IS NOT NULL ), '{}') as team_users, " +
          "       coalesce(array_agg(DISTINCT exercises_teams.exercise_id) FILTER ( WHERE exercises_teams.exercise_id IS NOT NULL ), '{}') as team_exercises, " +
          "       coalesce(array_agg(DISTINCT scenarios_teams.scenario_id) FILTER ( WHERE scenarios_teams.scenario_id IS NOT NULL ), '{}') as team_scenarios, " +
          "       coalesce(array_agg(DISTINCT injects_expectations.inject_expectation_id) FILTER ( WHERE injects_expectations.inject_expectation_id IS NOT NULL), '{}') as team_expectations, " +
          "       coalesce(array_agg(DISTINCT injects.inject_id) FILTER ( WHERE injects.inject_id IS NOT NULL), '{}') as team_exercise_injects, " +
          "       coalesce(array_agg(DISTINCT communications.communication_id) FILTER ( WHERE communications.communication_id IS NOT NULL), '{}') as team_communications " +
          "FROM teams " +
          "LEFT JOIN teams_tags ON teams_tags.team_id = teams.team_id " +
          "LEFT JOIN users_teams ON users_teams.team_id = teams.team_id " +
          "LEFT JOIN exercises_teams ON exercises_teams.team_id = teams.team_id " +
          "LEFT JOIN scenarios_teams ON scenarios_teams.team_id = teams.team_id " +
          "LEFT JOIN injects_expectations ON injects_expectations.team_id = teams.team_id " +
          "LEFT JOIN exercises ON exercises_teams.exercise_id = exercises.exercise_id " +
          "LEFT JOIN exercises_teams_users ON exercises_teams_users.team_id = teams.team_id " +
          "LEFT JOIN injects ON injects.inject_exercise = exercises.exercise_id " +
          "LEFT JOIN communications ON communications.communication_inject = injects.inject_id " +
          "GROUP BY teams.team_id ;", nativeQuery = true)
  List<RawTeam> rawTeams();

  @Query(value="SELECT teams.team_id, teams.team_name, teams.team_description, teams.team_created_at, teams.team_updated_at, teams.team_organization, " +
          "       team_contextual, " +
          "       coalesce(array_agg(DISTINCT teams_tags.tag_id) FILTER ( WHERE teams_tags.tag_id IS NOT NULL ), '{}') as team_tags, " +
          "       coalesce(array_agg(DISTINCT users_teams.user_id) FILTER ( WHERE users_teams.user_id IS NOT NULL ), '{}') as team_users, " +
          "       coalesce(array_agg(DISTINCT exercises_teams.exercise_id) FILTER ( WHERE exercises_teams.exercise_id IS NOT NULL ), '{}') as team_exercises, " +
          "       coalesce(array_agg(DISTINCT scenarios_teams.scenario_id) FILTER ( WHERE scenarios_teams.scenario_id IS NOT NULL ), '{}') as team_scenarios, " +
          "       coalesce(array_agg(DISTINCT injects_expectations.inject_expectation_id) FILTER ( WHERE injects_expectations.inject_expectation_id IS NOT NULL), '{}') as team_expectations, " +
          "       coalesce(array_agg(DISTINCT injects.inject_id) FILTER ( WHERE injects.inject_id IS NOT NULL), '{}') as team_exercise_injects, " +
          "       coalesce(array_agg(DISTINCT communications.communication_id) FILTER ( WHERE communications.communication_id IS NOT NULL), '{}') as team_communications " +
          "FROM teams " +
          "LEFT JOIN teams_tags ON teams_tags.team_id = teams.team_id " +
          "LEFT JOIN users_teams ON users_teams.team_id = teams.team_id " +
          "LEFT JOIN exercises_teams ON exercises_teams.team_id = teams.team_id " +
          "LEFT JOIN scenarios_teams ON scenarios_teams.team_id = teams.team_id " +
          "LEFT JOIN injects_expectations ON injects_expectations.team_id = teams.team_id " +
          "LEFT JOIN exercises ON exercises_teams.exercise_id = exercises.exercise_id " +
          "LEFT JOIN exercises_teams_users ON exercises_teams_users.team_id = teams.team_id " +
          "LEFT JOIN injects ON injects.inject_exercise = exercises.exercise_id " +
          "LEFT JOIN communications ON communications.communication_inject = injects.inject_id " +
          "WHERE teams.team_organization IS NULL OR teams.team_organization IN :organizationIds " +
          "GROUP BY teams.team_id ;", nativeQuery = true)
  List<RawTeam> rawTeamsAccessibleFromOrganization(@Param("organizationIds") List<String> organizationIds);

  @NotNull
  @EntityGraph(value = "Team.tags", type = EntityGraph.EntityGraphType.LOAD)
  Page<Team> findAll(@NotNull Specification<Team> spec, @NotNull Pageable pageable);

  @Query(value="SELECT teams.team_id, teams.team_name, teams.team_description, teams.team_created_at, teams.team_updated_at, teams.team_organization, " +
          "       team_contextual, " +
          "       coalesce(array_agg(DISTINCT teams_tags.tag_id) FILTER ( WHERE teams_tags.tag_id IS NOT NULL ), '{}') as team_tags, " +
          "       coalesce(array_agg(DISTINCT users_teams.user_id) FILTER ( WHERE users_teams.user_id IS NOT NULL ), '{}') as team_users, " +
          "       coalesce(array_agg(DISTINCT exercises_teams.exercise_id) FILTER ( WHERE exercises_teams.exercise_id IS NOT NULL ), '{}') as team_exercises, " +
          "       coalesce(array_agg(DISTINCT scenarios_teams.scenario_id) FILTER ( WHERE scenarios_teams.scenario_id IS NOT NULL ), '{}') as team_scenarios, " +
          "       coalesce(array_agg(DISTINCT injects_expectations.inject_expectation_id) FILTER ( WHERE injects_expectations.inject_expectation_id IS NOT NULL), '{}') as team_expectations, " +
          "       coalesce(array_agg(DISTINCT injects.inject_id) FILTER ( WHERE injects.inject_id IS NOT NULL), '{}') as team_exercise_injects, " +
          "       coalesce(array_agg(DISTINCT communications.communication_id) FILTER ( WHERE communications.communication_id IS NOT NULL), '{}') as team_communications " +
          "FROM teams " +
          "LEFT JOIN teams_tags ON teams_tags.team_id = teams.team_id " +
          "LEFT JOIN users_teams ON users_teams.team_id = teams.team_id " +
          "LEFT JOIN exercises_teams ON exercises_teams.team_id = teams.team_id " +
          "LEFT JOIN scenarios_teams ON scenarios_teams.team_id = teams.team_id " +
          "LEFT JOIN injects_expectations ON injects_expectations.team_id = teams.team_id " +
          "LEFT JOIN exercises ON exercises_teams.exercise_id = exercises.exercise_id " +
          "LEFT JOIN exercises_teams_users ON exercises_teams_users.team_id = teams.team_id " +
          "LEFT JOIN injects ON injects.inject_exercise = exercises.exercise_id " +
          "LEFT JOIN communications ON communications.communication_inject = injects.inject_id " +
          "WHERE exercises.exercise_id = :exerciseId GROUP BY teams.team_id ;", nativeQuery = true)
  List<RawTeam> rawTeamByExerciseId(@Param("exerciseId") String exerciseId);

  @Query(value="SELECT teams.team_id, teams.team_name, teams.team_description, teams.team_created_at, teams.team_updated_at, teams.team_organization, " +
          "       team_contextual, " +
          "       coalesce(array_agg(DISTINCT teams_tags.tag_id) FILTER ( WHERE teams_tags.tag_id IS NOT NULL ), '{}') as team_tags, " +
          "       coalesce(array_agg(DISTINCT users_teams.user_id) FILTER ( WHERE users_teams.user_id IS NOT NULL ), '{}') as team_users, " +
          "       coalesce(array_agg(DISTINCT exercises_teams.exercise_id) FILTER ( WHERE exercises_teams.exercise_id IS NOT NULL ), '{}') as team_exercises, " +
          "       coalesce(array_agg(DISTINCT scenarios_teams.scenario_id) FILTER ( WHERE scenarios_teams.scenario_id IS NOT NULL ), '{}') as team_scenarios, " +
          "       coalesce(array_agg(DISTINCT injects_expectations.inject_expectation_id) FILTER ( WHERE injects_expectations.inject_expectation_id IS NOT NULL), '{}') as team_expectations, " +
          "       coalesce(array_agg(DISTINCT injects.inject_id) FILTER ( WHERE injects.inject_id IS NOT NULL), '{}') as team_exercise_injects, " +
          "       coalesce(array_agg(DISTINCT communications.communication_id) FILTER ( WHERE communications.communication_id IS NOT NULL), '{}') as team_communications " +
          "FROM teams " +
          "LEFT JOIN teams_tags ON teams_tags.team_id = teams.team_id " +
          "LEFT JOIN users_teams ON users_teams.team_id = teams.team_id " +
          "LEFT JOIN exercises_teams ON exercises_teams.team_id = teams.team_id " +
          "LEFT JOIN scenarios_teams ON scenarios_teams.team_id = teams.team_id " +
          "LEFT JOIN injects_expectations ON injects_expectations.team_id = teams.team_id " +
          "LEFT JOIN exercises ON exercises_teams.exercise_id = exercises.exercise_id " +
          "LEFT JOIN exercises_teams_users ON exercises_teams_users.team_id = teams.team_id " +
          "LEFT JOIN injects ON injects.inject_exercise = exercises.exercise_id " +
          "LEFT JOIN communications ON communications.communication_inject = injects.inject_id " +
          "WHERE scenarios_teams.scenario_id = :scenarioId GROUP BY teams.team_id ;", nativeQuery = true)
  List<RawTeam> rawTeamByScenarioId(@Param("scenarioId") String scenarioId);

}
