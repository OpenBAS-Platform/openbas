package io.openex.service;

import io.openex.database.model.*;
import io.openex.database.repository.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.apache.commons.beanutils.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class ScenarioToExerciseService {

  private final ExerciseRepository exerciseRepository;
  private final GrantRepository grantRepository;
  private final TeamRepository teamRepository;
  private final ExerciseTeamUserRepository exerciseTeamUserRepository;
  private final ObjectiveRepository objectiveRepository;
  private final DocumentRepository documentRepository;
  private final ArticleRepository articleRepository;
  private final LessonsCategoryRepository lessonsCategoryRepository;
  private final LessonsQuestionRepository lessonsQuestionRepository;
  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final VariableService variableService;

  @Transactional(rollbackFor = Exception.class)
  public Exercise toExercise(@NotBlank final Scenario scenario) {
    Exercise exercise = new Exercise();
    exercise.setName(scenario.getName());
    exercise.setDescription(scenario.getDescription());
    exercise.setSubtitle(scenario.getSubtitle());
    exercise.setHeader(scenario.getHeader());
    exercise.setFooter(scenario.getFooter());
    exercise.setReplyTo(scenario.getReplyTo());

    // Tags
    exercise.setTags(copyTags(scenario.getTags()));

    Exercise exerciseSaved = this.exerciseRepository.save(exercise);

    // Grants
    List<Grant> exerciseGrants = scenario.getGrants().stream()
        .map(scenarioGrant -> {
          Grant grant = new Grant();
          grant.setName(scenarioGrant.getName());
          grant.setGroup(scenarioGrant.getGroup());
          grant.setExercise(exerciseSaved);
          return this.grantRepository.save(grant);
        })
        .toList();
    exerciseSaved.setGrants(exerciseGrants);

    // Teams
    Map<String, Team> contextualTeams = new HashMap<>();
    scenario.getTeams().forEach(scenarioTeam -> {
      if (scenarioTeam.getContextual()) {
        Team team = new Team();
        team.setName(scenarioTeam.getName());
        team.setDescription(scenarioTeam.getDescription());
        team.setTags(copyTags(scenarioTeam.getTags()));
        team.setOrganization(scenarioTeam.getOrganization());
        team.setUsers(scenarioTeam.getUsers());
        team.setExercises(new ArrayList<>() {{
          add(exerciseSaved);
        }});
        team.setContextual(scenarioTeam.getContextual());
        Team teamSaved = this.teamRepository.save(team);
        contextualTeams.put(scenarioTeam.getId(), teamSaved);
      } else {
        List<Exercise> exercises = scenarioTeam.getExercises();
        exercises.add(exercise);
        scenarioTeam.setExercises(exercises);
        this.teamRepository.save(scenarioTeam);
      }
    });

    // TeamUsers
    List<ExerciseTeamUser> exerciseTeamUsers = scenario.getTeamUsers().stream()
        .map(scenarioTeamUser -> {
          ExerciseTeamUser exerciseTeamUser = new ExerciseTeamUser();
          exerciseTeamUser.setExercise(exerciseSaved);
          exerciseTeamUser.setUser(scenarioTeamUser.getUser());
          exerciseTeamUser.setTeam(computeTeam(scenarioTeamUser.getTeam(), contextualTeams));
          return exerciseTeamUser;
        })
        .toList();
    this.exerciseTeamUserRepository.saveAll(exerciseTeamUsers);

    // Objectives
    List<Objective> scenarioObjectives = scenario.getObjectives();
    List<Objective> exerciseObjectives = scenarioObjectives.stream()
        .map(scenarioObjective -> {
          Objective exerciseObjective = new Objective();
          exerciseObjective.setExercise(exerciseSaved);
          exerciseObjective.setTitle(scenarioObjective.getTitle());
          exerciseObjective.setDescription(scenarioObjective.getDescription());
          exerciseObjective.setPriority(scenarioObjective.getPriority());
          return exerciseObjective;
        })
        .toList();
    this.objectiveRepository.saveAll(exerciseObjectives);

    // Documents
    List<Document> scenarioDocuments = addExerciseToDocuments(scenario.getDocuments(), exerciseSaved);
    this.documentRepository.saveAll(scenarioDocuments);

    // Articles
    List<Article> scenarioArticles = scenario.getArticles();
    List<Article> exerciseArticles = scenarioArticles.stream()
        .map(scenarioArticle -> {
          Article exerciseArticle = new Article();
          exerciseArticle.setName(scenarioArticle.getName());
          exerciseArticle.setContent(scenarioArticle.getContent());
          exerciseArticle.setAuthor(scenarioArticle.getAuthor());
          exerciseArticle.setShares(scenarioArticle.getShares());
          exerciseArticle.setLikes(scenarioArticle.getLikes());
          exerciseArticle.setComments(scenarioArticle.getComments());
          exerciseArticle.setExercise(exerciseSaved);
          exerciseArticle.setChannel(scenarioArticle.getChannel());

          List<Document> articleDocuments = addExerciseToDocuments(scenarioArticle.getDocuments(), exerciseSaved);
          exerciseArticle.setDocuments(articleDocuments);
          return exerciseArticle;
        })
        .toList();
    this.articleRepository.saveAll(exerciseArticles);

    // Lessons categories
    List<LessonsCategory> scenarioLessonCategories = scenario.getLessonsCategories();
    scenarioLessonCategories.forEach(scenarioLessonCategory -> {
      LessonsCategory exerciseLessonCategory = new LessonsCategory();
      exerciseLessonCategory.setExercise(exerciseSaved);
      exerciseLessonCategory.setName(scenarioLessonCategory.getName());
      exerciseLessonCategory.setDescription(scenarioLessonCategory.getDescription());
      exerciseLessonCategory.setOrder(scenarioLessonCategory.getOrder());

      // Teams
      List<Team> teams = new ArrayList<>();
      scenarioLessonCategory.getTeams().forEach(team -> teams.add(computeTeam(team, contextualTeams)));
      exerciseLessonCategory.setTeams(teams);

      LessonsCategory exerciseLessonCategorySaved = this.lessonsCategoryRepository.save(exerciseLessonCategory);

      // Lessons questions
      List<LessonsQuestion> exerciseLessonsQuestions = scenarioLessonCategory.getQuestions()
          .stream()
          .map(scenarioLessonsQuestion -> {
            LessonsQuestion exerciseLessonsQuestion = new LessonsQuestion();
            exerciseLessonsQuestion.setContent(scenarioLessonsQuestion.getContent());
            exerciseLessonsQuestion.setExplanation(scenarioLessonsQuestion.getExplanation());
            exerciseLessonsQuestion.setOrder(scenarioLessonsQuestion.getOrder());
            exerciseLessonsQuestion.setCategory(exerciseLessonCategorySaved);
            return exerciseLessonsQuestion;
          })
          .toList();
      this.lessonsQuestionRepository.saveAll(exerciseLessonsQuestions);
    });

    // Injects
    List<Inject> scenarioInjects = scenario.getInjects();
    scenarioInjects.forEach(scenarioInject -> {
      Inject exerciseInject = new Inject();
      exerciseInject.setTitle(scenarioInject.getTitle());
      exerciseInject.setDescription(scenarioInject.getDescription());
      exerciseInject.setContract(scenarioInject.getContract());
      exerciseInject.setCountry(scenarioInject.getCountry());
      exerciseInject.setCity(scenarioInject.getCity());
      exerciseInject.setEnabled(scenarioInject.isEnabled());
      exerciseInject.setType(scenarioInject.getType());
      exerciseInject.setContent(scenarioInject.getContent());
      exerciseInject.setAllTeams(scenarioInject.isAllTeams());
      exerciseInject.setExercise(exerciseSaved);
      exerciseInject.setDependsDuration(scenarioInject.getDependsDuration());
      exerciseInject.setUser(scenarioInject.getUser());
      exerciseInject.setStatus(scenarioInject.getStatus().orElse(null));
      exerciseInject.setTags(copyTags(scenarioInject.getTags()));

      // Teams
      List<Team> teams = new ArrayList<>();
      scenarioInject.getTeams().forEach(team -> teams.add(computeTeam(team, contextualTeams)));
      exerciseInject.setTeams(teams);

      exerciseInject.setAssets(scenarioInject.getAssets());
      exerciseInject.setAssetGroups(scenarioInject.getAssetGroups());
      Inject injectSaved = this.injectRepository.save(exerciseInject);

      List<InjectDocument> exerciseInjectDocuments = new ArrayList<>();
      scenarioInject.getDocuments().forEach(injectDocument -> {
        InjectDocument exerciseInjectDocument = new InjectDocument();
        exerciseInjectDocument.setInject(injectSaved);
        exerciseInjectDocument.setDocument(injectDocument.getDocument());
        exerciseInjectDocument.setAttached(injectDocument.isAttached());
        exerciseInjectDocuments.add(exerciseInjectDocument);
      });
      this.injectDocumentRepository.saveAll(exerciseInjectDocuments);
    });

    // Variables
    List<Variable> scenarioVariables = this.variableService.variablesFromScenario(scenario.getId());
    List<Variable> exerciseVariables = scenarioVariables.stream()
        .map(scenarioVariable -> {
          Variable exerciseVariable = new Variable();
          exerciseVariable.setKey(scenarioVariable.getKey());
          exerciseVariable.setValue(scenarioVariable.getValue());
          exerciseVariable.setDescription(scenarioVariable.getDescription());
          exerciseVariable.setType(scenarioVariable.getType());
          exerciseVariable.setExercise(exerciseSaved);
          return exerciseVariable;
        })
        .toList();
    this.variableService.createVariables(exerciseVariables);

    return exerciseSaved;
  }

  private List<Tag> copyTags(@NotNull final List<Tag> origTags) {
    List<Tag> destTags = new ArrayList<>();
    origTags.forEach(origTag -> {
      try {
        Tag destTag = new Tag();
        BeanUtils.copyProperties(destTag, origTag);
        destTags.add(destTag);
      } catch (IllegalAccessException | InvocationTargetException e) {
        throw new RuntimeException(e);
      }
    });
    return destTags;
  }

  private List<Document> addExerciseToDocuments(
      @NotNull final List<Document> origDocuments,
      @NotNull final Exercise exercise) {
    origDocuments.forEach(origDocument -> {
      List<Exercise> exercises = origDocument.getExercises();
      exercises.add(exercise);
      origDocument.setExercises(exercises);
    });
    return origDocuments;
  }

  private Team computeTeam(@NotNull final Team origTeam, @NotNull final Map<String, Team> contextualTeams) {
    if (origTeam.getContextual()) {
      return contextualTeams.get(origTeam.getId());
    } else {
      return origTeam;
    }
  }

}
