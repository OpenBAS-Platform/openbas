package io.openbas.database.raw;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public interface RawExercise {
  String getExercise_category();

  String getExercise_id();

  String getExercise_status();

  Instant getExercise_start_date();

  Instant getExercise_end_date();

  String getExercise_name();

  String getExercise_description();

  String getExercise_main_focus();

  String getExercise_severity();

  String getExercise_subtitle();

  List<String> getExercise_tags();

  List<String> getInject_ids();

  String getExercise_message_header();

  String getExercise_message_footer();

  String getExercise_mail_from();

  Set<String> getExercise_reply_to();

  String getExercise_logo_dark();

  String getExercise_logo_light();

  boolean getExercise_lessons_anonymized();

  String getScenario_id();

  Instant getExercise_created_at();

  Instant getExercise_updated_at();

  Set<String> getExercise_injects();

  Set<String> getExercise_teams();

  Set<String> getExercise_pauses();

  Instant getExercise_pause_date();

  Set<String> getExercise_documents();

  Set<String> getExercise_articles();

  Set<String> getExercise_lessons_categories();

  Set<String> getExercise_lessons_users();

  Set<String> getExercise_users();

  Set<String> getLessons_answers();

  Set<String> getUsers();

  Set<String> getLogs();
}
