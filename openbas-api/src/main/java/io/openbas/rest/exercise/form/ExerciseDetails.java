package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.*;
import io.openbas.database.raw.RawExercise;
import io.openbas.helper.InjectStatisticsHelper;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ExerciseDetails {

  @JsonProperty("exercise_id")
  @NotBlank
  private String id;

  @JsonProperty("exercise_name")
  @NotBlank
  private String name;

  @JsonProperty("exercise_description")
  private String description;

  @JsonProperty("exercise_status")
  @Enumerated(EnumType.STRING)
  private ExerciseStatus status;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @JsonProperty("exercise_category")
  private String category;

  @JsonProperty("exercise_main_focus")
  private String mainFocus;

  @JsonProperty("exercise_severity")
  private String severity;

  @JsonProperty("exercise_start_date")
  private Instant start;

  @JsonProperty("exercise_end_date")
  private Instant end;

  @JsonProperty("exercise_message_header")
  private String header;

  @JsonProperty("exercise_message_footer")
  private String footer;

  @JsonProperty("exercise_mail_from")
  private String from;

  @JsonProperty("exercise_mails_reply_to")
  private List<String> replyTo;

  @JsonProperty("exercise_lessons_anonymized")
  private boolean lessonsAnonymized;

  @JsonProperty("exercise_scenario")
  private String scenario;

  @JsonProperty("exercise_created_at")
  private Instant createAt;

  @JsonProperty("exercise_updated_at")
  private Instant updatedAt;

  @JsonProperty("exercise_injects")
  private Set<String> exerciseInjects;

  @JsonProperty("exercise_teams")
  private Set<String> exerciseTeams;

  @JsonProperty("exercise_teams_users")
  private Set<ExerciseTeamUser> exerciseTeamUsers;

  @JsonProperty("exercise_pauses")
  private Set<String> pauses = new HashSet<>();

  @JsonProperty("exercise_tags")
  private Set<String> tags = new HashSet<>();

  @JsonProperty("exercise_documents")
  private Set<String> documents = new HashSet<>();

  @JsonProperty("exercise_articles")
  private Set<String> articles = new HashSet<>();

  @JsonProperty("exercise_lessons_categories")
  private Set<String> lessonsCategories = new HashSet<>();

  @JsonProperty("exercise_users")
  private Set<String> users = new HashSet<>();

  @JsonProperty("exercise_observers")
  private Set<String> observers = new HashSet<>();

  @JsonProperty("exercise_lessons_answers_number")
  private long lessonsAnswersNumber;

  @JsonProperty("exercise_planners")
  private Set<String> planners = new HashSet<>();

  @JsonProperty("exercise_next_inject_date")
  private Instant nextInjectDate;

  @JsonProperty("exercise_all_users_number")
  private long allUsersNumber;

  @JsonProperty("exercise_users_number")
  private long usersNumber;

  @JsonProperty("exercise_logs_number")
  private long logsNumber;

  @JsonProperty("exercise_communications_number")
  public long communicationsNumber;

  // -- PLATFORMS --
  @JsonProperty("exercise_platforms")
  public List<String> platforms;

  // -- KILL CHAIN PHASES --
  @JsonProperty("exercise_kill_chain_phases")
  public List<KillChainPhase> killChainPhases;

  @JsonProperty("exercise_next_possible_status")
  private List<ExerciseStatus> getNextPossibleStatus() {
    if (ExerciseStatus.CANCELED.equals(status)) {
      return List.of(ExerciseStatus.SCHEDULED); // Via reset
    }
    if (ExerciseStatus.FINISHED.equals(status)) {
      return List.of(ExerciseStatus.SCHEDULED); // Via reset
    }
    if (ExerciseStatus.SCHEDULED.equals(status)) {
      return List.of(ExerciseStatus.RUNNING);
    }
    if (ExerciseStatus.RUNNING.equals(status)) {
      return List.of(ExerciseStatus.CANCELED, ExerciseStatus.PAUSED);
    }
    if (ExerciseStatus.PAUSED.equals(status)) {
      return List.of(ExerciseStatus.CANCELED, ExerciseStatus.RUNNING);
    }
    return List.of();
  }

  @JsonProperty("exercise_injects_statistics")
  public Map<String, Long> getInjectStatistics() {
    return InjectStatisticsHelper.getInjectStatistics(this.getInjects());
  }

  @JsonProperty("exercise_score")
  public Double getEvaluationAverage() {
    double evaluationAverage =
        getObjectives().stream().mapToDouble(Objective::getEvaluationAverage).average().orElse(0D);
    return Math.round(evaluationAverage * 100.0) / 100.0;
  }

  @JsonIgnore private List<Inject> injects;

  @JsonIgnore private List<Objective> objectives;

  /**
   * Create an Exercise Details object different from the one used in the lists from a Raw one
   *
   * @param exercise the raw exercise
   * @return an Exercise Simple object
   */
  public static ExerciseDetails fromRawExercise(
      RawExercise exercise,
      List<Inject> injects,
      List<ExerciseTeamUser> exerciseTeamsUsers,
      List<Objective> objectives) {
    ExerciseDetails details = new ExerciseDetails();

    details.setId(exercise.getExercise_id());
    details.setName(exercise.getExercise_name());
    details.setDescription(exercise.getExercise_description());
    details.setStatus(ExerciseStatus.valueOf(exercise.getExercise_status()));
    details.setSubtitle(exercise.getExercise_subtitle());
    details.setCategory(exercise.getExercise_category());
    details.setMainFocus(exercise.getExercise_main_focus());
    details.setSeverity(exercise.getExercise_severity());
    details.setStart(exercise.getExercise_start_date());
    details.setEnd(exercise.getExercise_end_date());
    details.setHeader(exercise.getExercise_message_header());
    details.setFooter(exercise.getExercise_message_footer());
    details.setFrom(exercise.getExercise_mail_from());
    if (exercise.getExercise_reply_to() != null) {
      details.setReplyTo(exercise.getExercise_reply_to().stream().toList());
    }
    details.setLessonsAnonymized(exercise.getExercise_lessons_anonymized());
    details.setScenario(exercise.getScenario_id());
    details.setCreateAt(exercise.getExercise_created_at());
    details.setUpdatedAt(exercise.getExercise_updated_at());
    details.setInjects(injects);
    details.setExerciseTeams(exercise.getExercise_teams());
    details.setExerciseTeamUsers(
        exerciseTeamsUsers != null ? new HashSet<>(exerciseTeamsUsers) : null);
    details.setPauses(exercise.getExercise_pauses());
    details.setTags(new HashSet<>(exercise.getExercise_tags()));
    details.setExerciseInjects(new HashSet<>(exercise.getInject_ids()));
    details.setDocuments(exercise.getExercise_documents());
    details.setArticles(exercise.getExercise_articles());
    details.setLessonsCategories(exercise.getExercise_lessons_categories());
    details.setUsers(exercise.getExercise_users());

    details.setInjects(injects);
    details.setObjectives(objectives);
    details.setLessonsAnswersNumber(
        exercise.getLessons_answers().stream().distinct().toList().size());

    details.setAllUsersNumber(exercise.getUsers().stream().distinct().toList().size());
    details.setUsersNumber(
        details.getExerciseTeamUsers().stream().map(ExerciseTeamUser::getUser).distinct().count());
    details.setLogsNumber(exercise.getLogs().stream().distinct().toList().size());

    return details;
  }
}
