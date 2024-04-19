package io.openbas.database.repository;

import io.openbas.database.model.Inject;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InjectRepository extends CrudRepository<Inject, String>, JpaSpecificationExecutor<Inject>,
    StatisticRepository {

  @NotNull
  Optional<Inject> findById(@NotNull String id);

  @NotNull
  Optional<Inject> findWithStatusById(@NotNull String id);

  @Query(value = "select i.* from injects i where i.inject_type = 'openbas_challenge'" +
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
      "inject_type, inject_contract, inject_all_teams, inject_enabled, inject_exercise, inject_depends_from_another, " +
      "inject_depends_duration, inject_content) " +
      "values (:id, :title, :description, :country, :city, :type, :contract, :allTeams, :enabled, :exercise, :dependsOn, :dependsDuration, :content)", nativeQuery = true)
  void importSave(@Param("id") String id,
      @Param("title") String title,
      @Param("description") String description,
      @Param("country") String country,
      @Param("city") String city,
      @Param("type") String type,
      @Param("contract") String contract,
      @Param("allTeams") boolean allTeams,
      @Param("enabled") boolean enabled,
      @Param("exercise") String exerciseId,
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
}
