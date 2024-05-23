package io.openbas.database.repository;

import io.openbas.database.model.Exercise;
import io.openbas.database.raw.RawExercise;
import io.openbas.database.raw.RawGlobalInjectExpectation;
import io.openbas.database.raw.RawInjectExpectation;
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
public interface ExerciseRepository extends CrudRepository<Exercise, String>,
    StatisticRepository,
    JpaSpecificationExecutor<Exercise> {

    @NotNull
    Optional<Exercise> findById(@NotNull String id);

    @Query(value = "select e from Exercise e where e.status = 'SCHEDULED' and e.start <= :start")
    List<Exercise> findAllShouldBeInRunningState(@Param("start") Instant start);

    @Query("select distinct e from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId")
    List<Exercise> findAllGranted(@Param("userId") String userId);

    @Override
    @Query("select count(distinct e) from Exercise e " +
            "join e.grants as grant " +
            "join grant.group.users as user " +
            "where user.id = :userId and e.createdAt < :creationDate")
    long userCount(@Param("userId") String userId, @Param("creationDate") Instant creationDate);

    @Override
    @Query("select count(distinct e) from Exercise e where e.createdAt < :creationDate")
    long globalCount(@Param("creationDate") Instant creationDate);

    @Query(value = "select e.*, se.scenario_id from exercises e " +
            "left join injects as inject on e.exercise_id = inject.inject_exercise " +
            "left join injects_statuses as status on inject.inject_id = status.status_inject and status.status_name != 'PENDING'" +
            "left join scenarios_exercises as se on e.exercise_id = se.exercise_id " +
            "where e.exercise_status = 'RUNNING' group by e.exercise_id, se.scenario_id having count(status) = count(inject);", nativeQuery = true)
    List<Exercise> thatMustBeFinished();

    @Query(value = "SELECT ie.inject_expectation_type, ie.inject_expectation_score " +
            "FROM injects_expectations ie " +
            "INNER JOIN injects ON ie.inject_id = injects.inject_id " +
            "INNER JOIN exercises ON injects.inject_exercise = exercises.exercise_id " +
            "WHERE exercises.exercise_created_at < :from ;", nativeQuery = true)
    List<RawInjectExpectation> allInjectExpectationsFromDate(@Param("from") Instant from);

    @Query(value = "SELECT ie.inject_expectation_type, ie.inject_expectation_score " +
            "FROM injects_expectations ie " +
            "INNER JOIN injects ON ie.inject_id = injects.inject_id " +
            "INNER JOIN exercises e ON injects.inject_exercise = e.exercise_id " +
            "INNER join grants ON grants.grant_exercise = e.exercise_id " +
            "INNER join groups ON grants.grant_group = groups.group_id " +
            "INNER JOIN users_groups ON groups.group_id = users_groups.group_id " +
            "WHERE e.exercise_created_at < :from " +
            "AND users_groups.user_id = :userId ;", nativeQuery = true)
    List<RawInjectExpectation> allGrantedInjectExpectationsFromDate(@Param("from") Instant from, @Param("userId") String userId);

    @Query(value = "SELECT ie.inject_expectation_type, ie.inject_expectation_score, injects.inject_title, icap.attack_pattern_id " +
            "FROM exercises " +
            "INNER JOIN injects ON exercises.exercise_id = injects.inject_exercise " +
            "LEFT JOIN injects_expectations ie ON exercises.exercise_id = ie.exercise_id " +
            "INNER JOIN injectors_contracts ic ON injects.inject_injector_contract = ic.injector_contract_id " +
            "INNER JOIN injectors_contracts_attack_patterns icap ON ic.injector_contract_id = icap.injector_contract_id " +
            "WHERE exercises.exercise_created_at < :from ;", nativeQuery = true)
    Iterable<RawGlobalInjectExpectation> rawGlobalInjectExpectationResultsFromDate(@Param("from") Instant from);

    @Query(value = "SELECT ie.inject_expectation_type, ie.inject_expectation_score, injects.inject_title, icap.attack_pattern_id " +
            "FROM exercises " +
            "INNER JOIN injects ON exercises.exercise_id = injects.inject_exercise " +
            "LEFT JOIN injects_expectations ie ON exercises.exercise_id = ie.exercise_id " +
            "INNER JOIN injectors_contracts ic ON injects.inject_injector_contract = ic.injector_contract_id " +
            "INNER JOIN injectors_contracts_attack_patterns icap ON ic.injector_contract_id = icap.injector_contract_id " +
            "INNER join grants ON grants.grant_exercise = exercises.exercise_id " +
            "INNER join groups ON grants.grant_group = groups.group_id " +
            "INNER JOIN users_groups ON groups.group_id = users_groups.group_id " +
            "WHERE exercises.exercise_created_at < :from " +
            "AND users_groups.user_id = :userId ;", nativeQuery = true)
    Iterable<RawGlobalInjectExpectation> rawGrantedInjectExpectationResultsFromDate(@Param("from") Instant from, @Param("userId") String userId);

    @Query(value = " SELECT ex.exercise_category, ex.exercise_id, ex.exercise_status, ex.exercise_start_date, ex.exercise_name, " +
            " ex.exercise_subtitle, array_agg(et.tag_id) FILTER ( WHERE et.tag_id IS NOT NULL ) as exercise_tags, " +
            " array_agg(injects.inject_id) FILTER ( WHERE injects.inject_id IS NOT NULL ) as inject_ids, " +
            " ie.inject_expectation_type, ie.inject_expectation_score " +
            "FROM exercises ex " +
            "LEFT JOIN injects_expectations ie ON ex.exercise_id = ie.exercise_id " +
            "LEFT JOIN injects ON ie.inject_id = injects.inject_id " +
            "LEFT JOIN exercises_tags et ON et.exercise_id = ex.exercise_id " +
            "GROUP BY ex.exercise_id, ie.inject_expectation_type, ie.inject_expectation_score ;", nativeQuery = true)
    List<RawExercise> rawAll();

    @Query(value = " SELECT ex.exercise_category, ex.exercise_id, ex.exercise_status, ex.exercise_start_date, ex.exercise_name, " +
            " ex.exercise_subtitle, array_agg(et.tag_id) FILTER ( WHERE et.tag_id IS NOT NULL ) as exercise_tags, " +
            " array_agg(injects.inject_id) FILTER ( WHERE injects.inject_id IS NOT NULL ) as inject_ids, " +
            " ie.inject_expectation_type, ie.inject_expectation_score " +
            "FROM exercises ex " +
            "LEFT JOIN injects_expectations ie ON ex.exercise_id = ie.exercise_id " +
            "LEFT JOIN injects ON ie.inject_id = injects.inject_id " +
            "LEFT JOIN exercises_tags et ON et.exercise_id = ex.exercise_id " +
            "INNER join grants ON grants.grant_exercise = exercises.exercise_id " +
            "INNER join groups ON grants.grant_group = groups.group_id " +
            "INNER JOIN users_groups ON groups.group_id = users_groups.group_id " +
            "WHERE users_groups.user_id = :userId ;" +
            "GROUP BY ex.exercise_id, ie.inject_expectation_type, ie.inject_expectation_score ;", nativeQuery = true)
    List<RawExercise> rawAllGranted(@Param("userId") String userId);

    @Query(value = "SELECT ie.inject_expectation_type, ie.inject_expectation_score " +
            "FROM injects_expectations ie " +
            "INNER JOIN injects ON ie.inject_id = injects.inject_id " +
            "INNER JOIN exercises ON injects.inject_exercise = exercises.exercise_id " +
            "WHERE exercises.exercise_created_at < :from ;", nativeQuery = true)
    List<RawInjectExpectation> rawInjectOfExerciceList(@Param("from") Instant from);
}
