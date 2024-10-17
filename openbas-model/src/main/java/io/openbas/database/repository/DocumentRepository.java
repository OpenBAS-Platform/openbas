package io.openbas.database.repository;

import io.openbas.database.model.Document;
import io.openbas.database.raw.RawDocument;
import java.util.List;
import java.util.Optional;
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

@Repository
public interface DocumentRepository
    extends CrudRepository<Document, String>, JpaSpecificationExecutor<Document> {

  @NotNull
  Optional<Document> findById(@NotNull String id);

  List<Document> removeById(@NotNull String id);

  @NotNull
  Optional<Document> findByTarget(@NotNull String target);

  @NotNull
  Optional<Document> findByName(@NotNull String name);

  @Query(
      "select d from Document d "
          + "join d.exercises as exercise "
          + "join exercise.grants as grant "
          + "join grant.group as g "
          + "join g.users as user "
          + "where d.id = :id and user.id = :userId")
  Optional<Document> findByIdGranted(
      @Param("id") String documentId, @Param("userId") String userId);

  @Query(
      value =
          "select d.*, "
              + "array_remove(array_agg(tg.tag_id), NULL) as document_tags, "
              + "array_remove(array_agg(ex.exercise_id), NULL) as document_exercises, "
              + "array_remove(array_agg(sc.scenario_id), NULL) as document_scenarios "
              + "from documents d left join exercises_documents exdoc on d.document_id = exdoc.document_id "
              + "left join exercises ex on ex.exercise_id = exdoc.exercise_id "
              + "left join scenarios_documents scdoc on d.document_id = scdoc.document_id "
              + "left join scenarios sc on sc.scenario_id = scdoc.scenario_id "
              + "left join documents_tags tagdoc on d.document_id = tagdoc.document_id "
              + "left join tags tg on tg.tag_id = tagdoc.tag_id "
              + "group by d.document_id "
              + "order by document_id desc ",
      nativeQuery = true)
  List<RawDocument> rawAllDocuments();

  @Query(
      value =
          "select d.*, "
              + "array_remove(array_agg(tg.tag_id), NULL) as document_tags, "
              + "array_remove(array_agg(ex.exercise_id), NULL) as document_exercises, "
              + "array_remove(array_agg(sc.scenario_id), NULL) as document_scenarios "
              + "from documents d left join exercises_documents exdoc on d.document_id = exdoc.document_id "
              + "left join exercises ex on ex.exercise_id = exdoc.exercise_id "
              + "left join scenarios_documents scdoc on d.document_id = scdoc.document_id "
              + "left join scenarios sc on sc.scenario_id = scdoc.scenario_id "
              + "left join documents_tags tagdoc on d.document_id = tagdoc.document_id "
              + "left join tags tg on tg.tag_id = tagdoc.tag_id "
              + "left join grants grt on grt.grant_exercise = exdoc.exercise_id "
              + "left join groups grp on grt.grant_group = grp.group_id "
              + "left join users_groups usgrp on grp.group_id = usgrp.group_id "
              + "left outer join users u on usgrp.user_id = u.user_id "
              + "where u.user_id = :userId "
              + "group by d.document_id "
              + "order by d.document_id desc ",
      nativeQuery = true)
  List<RawDocument> rawAllDocumentsByAccessLevel(@Param("userId") String userId);

  // -- PAGINATION --

  @NotNull
  @EntityGraph(value = "Document.tags-scenarios-exercises", type = EntityGraph.EntityGraphType.LOAD)
  Page<Document> findAll(@NotNull Specification<Document> spec, @NotNull Pageable pageable);
}
