package io.openbas.rest.exercise.exports;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;
import static io.openbas.helper.StreamHelper.fromIterable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import io.openbas.service.ChallengeService;
import io.openbas.service.VariableService;
import jakarta.annotation.Resource;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Getter
@Setter
@JsonInclude(NON_NULL)
@Component
public class ExerciseFileExport {

  private ChallengeService challengeService;

  private VariableService variableService;

  private ObjectMapper objectMapper;

  @JsonProperty("export_version")
  private int version = 1;

  @JsonProperty("exercise_information")
  private Exercise exercise;

  @JsonProperty("exercise_teams")
  private List<Team> teams;

  public List<Team> getTeams() {
    if(teams == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getTeams();
    }
    return teams;
  }

  @JsonProperty("exercise_objectives")
  private List<Objective> objectives;

  public List<Objective> getObjectives() {
    if(objectives == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getObjectives();
    }
    return objectives;
  }

  @JsonProperty("exercise_users")
  private List<User> users;

  public List<User> getUsers() {
    if(users == null) {
      return this.exercise != null && ExportOptions.has(ExportOptions.WITH_PLAYERS, this.exportOptionsMask)
              ? this.exercise.getUsers()
              : new ArrayList<>();
    }
    return users;
  }

  @JsonProperty("exercise_organizations")
  private List<Organization> organizations;

  public List<Organization> getOrganizations() {
    if(organizations == null) {
      return this.exercise == null
              ? new ArrayList<>()
              : this.exercise.getUsers().stream().map(User::getOrganization).filter(Objects::nonNull).distinct().toList();
    }
    return organizations;
  }

  @JsonProperty("exercise_injects")
  private List<Inject> injects;

  public List<Inject> getInjects() {
    if(injects == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getInjects();
    }
    return injects;
  }

  @JsonProperty("exercise_tags")
  private List<Tag> tags;

  public List<Tag> getTags() {
    if(tags == null) {
      if (this.exercise == null)
      {
        return new ArrayList<>();
      } else {
        List<Tag> allTags = new ArrayList<>();
        allTags.addAll(this.exercise.getTags().stream().toList());
        allTags.addAll(this.getTeams().stream().flatMap(team -> team.getTags().stream()).toList());
        allTags.addAll(this.getUsers().stream().flatMap(user -> user.getTags().stream()).toList());
        allTags.addAll(this.getOrganizations().stream().flatMap(organization -> organization.getTags().stream()).toList());
        allTags.addAll(this.getDocuments().stream().flatMap(doc -> doc.getTags().stream()).toList());
        allTags.addAll(this.getChallenges().stream().flatMap(challenge -> challenge.getTags().stream()).toList());
        this.getInjects().forEach(
                inject -> {
                  allTags.addAll(inject.getTags());
                  inject
                          .getInjectorContract()
                          .ifPresent(
                                  injectorContract -> {
                                    if (injectorContract.getPayload() != null) {
                                      allTags.addAll(injectorContract.getPayload().getTags());
                                    }
                                  });
                  allTags.addAll(inject.getTags());
                });

        return allTags;
      }
    }
    return tags;
  }

  @JsonProperty("exercise_documents")
  private List<Document> documents;

  public List<Document> getDocuments() {
    if(documents == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getDocuments();
    }
    return documents;
  }

  @JsonProperty("exercise_channels")
  private List<Channel> channels;

  public List<Channel> getChannels() {
    if(channels == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getArticles().stream().map(Article::getChannel).distinct().toList();
    }
    return channels;
  }

  @JsonProperty("exercise_articles")
  private List<Article> articles;

  public List<Article> getArticles() {
    if(articles == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getArticles();
    }
    return articles;
  }

  @JsonProperty("exercise_challenges")
  private List<Challenge> challenges;

  public List<Challenge> getChallenges() {
    if(challenges == null) {
      return this.exercise == null ? new ArrayList<>() : fromIterable(challengeService.getExerciseChallenges(this.exercise.getId()));
    }
    return challenges;
  }

  @JsonProperty("exercise_lessons_categories")
  private List<LessonsCategory> lessonsCategories;

  public List<LessonsCategory> getLessonsCategories() {
    if(lessonsCategories == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getLessonsCategories();
    }
    return lessonsCategories;
  }

  @JsonProperty("exercise_lessons_questions")
  private List<LessonsQuestion> lessonsQuestions;

  public List<LessonsQuestion> getLessonsQuestions() {
    if(lessonsQuestions == null) {
      return this.exercise == null ? new ArrayList<>() : this.exercise.getLessonsCategories().stream().flatMap(category -> category.getQuestions().stream()).toList();
    }
    return lessonsQuestions;
  }

  @JsonIgnore public static final String EXERCISE_VARIABLES = "exercise_variables";

  @JsonProperty(EXERCISE_VARIABLES)
  private List<Variable> variables;

  public List<Variable> getVariables() {
    if(variables == null) {
      return this.exercise == null ? new ArrayList<>() : this.variableService.variablesFromExercise(this.exercise.getId());
    }
    return variables;
  }

  public List<String> getAllDocumentIds() {
    List<String> documentIds = new ArrayList<>();
    documentIds.addAll(this.getDocuments().stream().map(Document::getId).toList());
    documentIds.addAll(
            this.getChannels().stream()
                    .flatMap(channel -> channel.getLogos().stream())
                    .map(Document::getId)
                    .toList());
    documentIds.addAll(
            this.getChallenges().stream()
                    .flatMap(challenge -> challenge.getDocuments().stream())
                    .map(Document::getId)
                    .toList());
    return documentIds;
  }

  private int exportOptionsMask = 0;

  public ExerciseFileExport(ObjectMapper objectMapper, VariableService variableService, ChallengeService challengeService) {
    this.objectMapper = objectMapper;
    this.variableService = variableService;
    this.challengeService = challengeService;

    this.objectMapper.addMixIn(Exercise.class, ExerciseExportMixins.Exercise.class);
    this.objectMapper.addMixIn(Document.class, ExerciseExportMixins.Document.class);
    this.objectMapper.addMixIn(Objective.class, ExerciseExportMixins.Objective.class);
    this.objectMapper.addMixIn(LessonsCategory.class, ExerciseExportMixins.LessonsCategory.class);
    this.objectMapper.addMixIn(LessonsQuestion.class, ExerciseExportMixins.LessonsQuestion.class);
    this.objectMapper.addMixIn(User.class, ExerciseExportMixins.User.class);
    this.objectMapper.addMixIn(Organization.class, ExerciseExportMixins.Organization.class);
    this.objectMapper.addMixIn(Inject.class, ExerciseExportMixins.Inject.class);
    this.objectMapper.addMixIn(Article.class, ExerciseExportMixins.Article.class);
    this.objectMapper.addMixIn(Channel.class, ExerciseExportMixins.Channel.class);
    this.objectMapper.addMixIn(Challenge.class, ExerciseExportMixins.Challenge.class);
    this.objectMapper.addMixIn(Tag.class, ExerciseExportMixins.Tag.class);

    // default options
    // variables with no value
    this.objectMapper.addMixIn(Variable.class, VariableMixin.class);
    //empty teams
    this.objectMapper.addMixIn(Team.class, ExerciseExportMixins.EmptyTeam.class);
  }

  public static final ExerciseFileExport fromExercise(Exercise exercise, ObjectMapper objectMapper, VariableService variableService, ChallengeService challengeService) {
    ExerciseFileExport efe = new ExerciseFileExport(objectMapper, variableService, challengeService);
    efe.setExercise(exercise);
    return efe;
  }

  public ExerciseFileExport withOptions(int exportOptionsMask) {
    this.exportOptionsMask = exportOptionsMask;

    // disable users if not requested; note negation
    if (!ExportOptions.has(ExportOptions.WITH_PLAYERS, this.exportOptionsMask)) {
      this.objectMapper.addMixIn(
              ExerciseFileExport.class, ExerciseExportMixins.ExerciseFileExport.class);
    }

    if (ExportOptions.has(ExportOptions.WITH_PLAYERS, this.exportOptionsMask)) {
      this.objectMapper.addMixIn(
              Team.class,
              ExportOptions.has(ExportOptions.WITH_PLAYERS, this.exportOptionsMask) ? ExerciseExportMixins.Team.class : ExerciseExportMixins.EmptyTeam.class);
    }
    if (ExportOptions.has(ExportOptions.WITH_VARIABLE_VALUES, this.exportOptionsMask)) {
      this.objectMapper.addMixIn(Variable.class, VariableWithValueMixin.class);
    } else {
      this.objectMapper.addMixIn(Variable.class, VariableMixin.class);
    }

    return this;
  }

}
