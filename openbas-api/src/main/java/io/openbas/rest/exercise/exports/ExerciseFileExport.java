package io.openbas.rest.exercise.exports;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.*;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(NON_NULL)
public class ExerciseFileExport {

  @JsonProperty("export_version")
  private int version;

  @JsonProperty("exercise_information")
  private Exercise exercise;

  @JsonProperty("exercise_teams")
  private List<Team> teams = new ArrayList<>();

  @JsonProperty("exercise_objectives")
  private List<Objective> objectives = new ArrayList<>();

  @JsonProperty("exercise_users")
  private List<User> users = new ArrayList<>();

  @JsonProperty("exercise_organizations")
  private List<Organization> organizations = new ArrayList<>();

  @JsonProperty("exercise_injects")
  private List<Inject> injects = new ArrayList<>();

  @JsonProperty("exercise_tags")
  private List<Tag> tags = new ArrayList<>();

  @JsonProperty("exercise_documents")
  private List<Document> documents = new ArrayList<>();

  @JsonProperty("exercise_channels")
  private List<Channel> channels = new ArrayList<>();

  @JsonProperty("exercise_articles")
  private List<Article> articles = new ArrayList<>();

  @JsonProperty("exercise_challenges")
  private List<Challenge> challenges = new ArrayList<>();

  @JsonProperty("exercise_lessons_categories")
  private List<LessonsCategory> lessonsCategories = new ArrayList<>();

  @JsonProperty("exercise_lessons_questions")
  private List<LessonsQuestion> lessonsQuestions = new ArrayList<>();

  @JsonIgnore public static final String EXERCISE_VARIABLES = "exercise_variables";

  @JsonProperty(EXERCISE_VARIABLES)
  private List<Variable> variables;
}
