package io.openbas.database.repository;

import io.openbas.database.model.Document;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentDeleteRepository
    extends CrudRepository<Document, String>, JpaSpecificationExecutor<Document> {

  @Query(
      value =
          "SELECT e.exercise_id, e.exercise_name  FROM exercises e WHERE e.exercise_logo_dark = :documentId OR e.exercise_logo_light = :documentId",
      nativeQuery = true)
  List<Object[]> findExercisesUsingDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT p.payload_id, p.payload_name FROM payloads p WHERE p.file_drop_file = :documentId OR p.executable_file = :documentId",
      nativeQuery = true)
  List<Object[]> findPayloadsByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT a.asset_id, a.asset_name FROM assets a WHERE a.security_platform_logo_light = :documentId OR a.security_platform_logo_dark = :documentId",
      nativeQuery = true)
  List<Object[]> findAssetsByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT c.channel_id, c.channel_name FROM channels c WHERE c.channel_logo_dark = :documentId OR c.channel_logo_light = :documentId",
      nativeQuery = true)
  List<Object[]> findChannelsByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT e.exercise_id, e.exercise_name FROM exercises_documents ed JOIN exercises e ON ed.exercise_id = e.exercise_id WHERE ed.document_id = :documentId",
      nativeQuery = true)
  List<Object[]> findExerciseDocumentsByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT i.inject_id, i.inject_title FROM injects_documents id JOIN injects i ON id.inject_id = i.inject_id WHERE id.document_id = :documentId",
      nativeQuery = true)
  List<Object[]> findInjectsByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT a.article_id, a.article_name FROM articles_documents ad JOIN articles a ON ad.article_id = a.article_id WHERE ad.document_id = :documentId",
      nativeQuery = true)
  List<Object[]> findArticlesByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          " SELECT t.tag_id, t.tag_name FROM documents_tags dt JOIN tags t ON dt.tag_id = t.tag_id WHERE dt.document_id = :documentId",
      nativeQuery = true)
  List<Object[]> findTagsByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT s.scenario_id, s.scenario_name FROM scenarios_documents sd JOIN scenarios s ON sd.scenario_id = s.scenario_id WHERE sd.document_id = :documentId",
      nativeQuery = true)
  List<Object[]> findScenariosByDocument(@Param("documentId") String documentId);

  @Query(
      value =
          "SELECT c.challenge_id, c.challenge_name FROM challenges_documents cd JOIN challenges c ON cd.challenge_id = c.challenge_id WHERE cd.document_id = :documentId",
      nativeQuery = true)
  List<Object[]> findChallengesByDocument(@Param("documentId") String documentId);

  // Delete
  @Modifying
  @Query(
      value = "DELETE FROM exercises_documents WHERE document_id = :documentId",
      nativeQuery = true)
  void deleteFromExerciseDocuments(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "DELETE FROM injects_documents WHERE document_id = :documentId",
      nativeQuery = true)
  void deleteFromInjectsDocuments(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "DELETE FROM articles_documents WHERE document_id = :documentId",
      nativeQuery = true)
  void deleteFromArticlesDocuments(@Param("documentId") String documentId);

  @Modifying
  @Query(value = "DELETE FROM documents_tags WHERE document_id = :documentId", nativeQuery = true)
  void deleteFromDocumentTags(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "DELETE FROM scenarios_documents WHERE document_id = :documentId",
      nativeQuery = true)
  void deleteFromScenarioDocuments(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "DELETE FROM challenges_documents WHERE document_id = :documentId",
      nativeQuery = true)
  void deleteFromChallengesDocuments(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "UPDATE exercises SET logo_dark = NULL WHERE logo_dark = :documentId",
      nativeQuery = true)
  void clearLogoDarkInExercises(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "UPDATE exercises SET logo_light = NULL WHERE logo_light = :documentId",
      nativeQuery = true)
  void clearLogoLightInExercises(@Param("documentId") String documentId);

  default void clearLogoInExercises(String documentId) {
    clearLogoDarkInExercises(documentId);
    clearLogoLightInExercises(documentId);
  }

  @Modifying
  @Query(
      value = "UPDATE channels SET logo_dark = NULL WHERE logo_dark = :documentId",
      nativeQuery = true)
  void clearLogoDarkInChannels(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "UPDATE channels SET logo_light = NULL WHERE logo_light = :documentId",
      nativeQuery = true)
  void clearLogoLightInChannels(@Param("documentId") String documentId);

  default void clearLogoInChannels(String documentId) {
    clearLogoDarkInChannels(documentId);
    clearLogoLightInChannels(documentId);
  }

  @Modifying
  @Query(
      value = "UPDATE payloads SET file_drop_file = NULL WHERE file_drop_file = :documentId",
      nativeQuery = true)
  void clearFileDropInPayloads(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value = "UPDATE payloads SET executable_file = NULL WHERE executable_file = :documentId",
      nativeQuery = true)
  void clearExecutableInPayloads(@Param("documentId") String documentId);

  default void clearFileInPayloads(String documentId) {
    clearFileDropInPayloads(documentId);
    clearExecutableInPayloads(documentId);
  }

  @Modifying
  @Query(
      value =
          "UPDATE assets SET security_platform_logo_light = NULL  WHERE security_platform_logo_light = :documentId",
      nativeQuery = true)
  void clearLogoLightInAssets(@Param("documentId") String documentId);

  @Modifying
  @Query(
      value =
          "UPDATE assets SET security_platform_logo_dark = NULL WHERE security_platform_logo_dark = :documentId",
      nativeQuery = true)
  void clearLogoDarkInAssets(@Param("documentId") String documentId);

  default void clearLogoInAssets(String documentId) {
    clearLogoLightInAssets(documentId);
    clearLogoDarkInAssets(documentId);
  }
}
