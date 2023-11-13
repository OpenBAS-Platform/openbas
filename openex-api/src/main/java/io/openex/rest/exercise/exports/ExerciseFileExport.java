package io.openex.rest.exercise.exports;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ExerciseFileExport {

  @JsonProperty("export_version")
  private int version;

  @JsonProperty("exercise_information")
  private Exercise exercise;

  @JsonProperty("exercise_audiences")
  private List<Audience> audiences = new ArrayList<>();

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

  @JsonProperty("exercise_medias")
  private List<Media> medias = new ArrayList<>();

  @JsonProperty("exercise_articles")
  private List<Article> articles = new ArrayList<>();

  @JsonProperty("exercise_challenges")
  private List<Challenge> challenges = new ArrayList<>();

  @JsonProperty("exercise_lessons_categories")
  private List<LessonsCategory> lessonsCategories = new ArrayList<>();

  @JsonProperty("exercise_lessons_questions")
  private List<LessonsQuestion> lessonsQuestions = new ArrayList<>();


  @JsonProperty("exercise_variables")
  private List<Variable> variables;

}
