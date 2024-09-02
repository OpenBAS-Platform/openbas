package io.openbas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.database.raw.RawPaginationScenario;
import io.openbas.database.raw.RawScenario;
import io.openbas.database.repository.*;
import io.openbas.database.specification.ScenarioSpecification;
import io.openbas.helper.ObjectMapperHelper;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exercise.exports.ExerciseExportMixins;
import io.openbas.rest.exercise.exports.ExerciseFileExport;
import io.openbas.rest.exercise.exports.VariableMixin;
import io.openbas.rest.exercise.exports.VariableWithValueMixin;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.rest.scenario.export.ScenarioExportMixins;
import io.openbas.rest.scenario.export.ScenarioFileExport;
import io.openbas.rest.scenario.form.ScenarioSimple;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.database.specification.ScenarioSpecification.findGrantedFor;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.scenario.utils.ScenarioUtils.handleDeepFilter;
import static io.openbas.service.ImportService.EXPORT_ENTRY_ATTACHMENT;
import static io.openbas.service.ImportService.EXPORT_ENTRY_SCENARIO;
import static io.openbas.utils.Constants.ARTICLES;
import static io.openbas.utils.StringUtils.duplicateString;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;
import static java.time.Instant.now;
import static java.util.Optional.ofNullable;

@RequiredArgsConstructor
@Service
@Log
@Validated
public class ScenarioService {

  @Value("${openbas.mail.imap.enabled}")
  private boolean imapEnabled;

  @Value("${openbas.mail.imap.username}")
  private String imapUsername;

  @Resource
  private OpenBASConfig openBASConfig;

  @PersistenceContext
  private EntityManager entityManager;

  private final ScenarioRepository scenarioRepository;
  private final TeamRepository teamRepository;
  private final UserRepository userRepository;
  private final DocumentRepository documentRepository;
  private final ScenarioTeamUserRepository scenarioTeamUserRepository;
  private final ArticleRepository articleRepository;

  private final GrantService grantService;
  private final VariableService variableService;
  private final ChallengeService challengeService;
  private final TeamService teamService;
  private final FileService fileService;
  private final InjectDuplicateService injectDuplicateService;

  @Transactional
  public Scenario createScenario(@NotNull final Scenario scenario) {
    if (this.imapEnabled) {
      scenario.setFrom(this.imapUsername);
      scenario.setReplyTos(List.of(this.imapUsername));
    } else {
      scenario.setFrom(this.openBASConfig.getDefaultMailer());
      scenario.setReplyTos(List.of(this.openBASConfig.getDefaultReplyTo()));
    }
    this.grantService.computeGrant(scenario);
    return this.scenarioRepository.save(scenario);
  }

  public List<ScenarioSimple> scenarios() {
    List<RawScenario> scenarios;
    if (currentUser().isAdmin()) {
      scenarios = fromIterable(this.scenarioRepository.rawAll());
    } else {
      scenarios = this.scenarioRepository.rawAllGranted(currentUser().getId());
    }
    return scenarios.stream().map(ScenarioSimple::fromRawScenario).toList();
  }

  public Page<RawPaginationScenario> scenarios(@NotNull final SearchPaginationInput searchPaginationInput) {
    Function<Specification<Scenario>, Specification<Scenario>> finalSpecification = handleDeepFilter(searchPaginationInput);
    if (currentUser().isAdmin()) {
      return buildPaginationCriteriaBuilder(
          (Specification<Scenario> specification, Pageable pageable) -> this.findAllWithCriteriaBuilder(
              finalSpecification.apply(specification),
              pageable
          ),
          searchPaginationInput,
          Scenario.class
      );
    } else {
      return buildPaginationCriteriaBuilder(
          (Specification<Scenario> specification, Pageable pageable) -> this.findAllWithCriteriaBuilder(
              findGrantedFor(currentUser().getId()).and(finalSpecification.apply(specification)),
              pageable
          ),
          searchPaginationInput,
          Scenario.class
      );
    }
  }

  private Page<RawPaginationScenario> findAllWithCriteriaBuilder(
      Specification<Scenario> specification,
      Pageable pageable) {
    CriteriaBuilder cb = entityManager.getCriteriaBuilder();

    // -- Create Query --
    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    // FROM
    Root<Scenario> scenarioRoot = cq.from(Scenario.class);
    // Join on TAG
    Join<Scenario, Tag> scenarioTagsJoin = scenarioRoot.join("tags", JoinType.LEFT);
    Expression<String[]> tagIdsExpression =
        cb.function(
            "array_remove",
            String[].class,
            cb.function("array_agg", String[].class, scenarioTagsJoin.get("id")),
            cb.nullLiteral(String.class)
        );
    // Join on INJECT and INJECTOR CONTRACT
    Join<Scenario, Inject> injectsJoin = scenarioRoot.join("injects", JoinType.LEFT);
    Join<Inject, InjectorContract> injectorsContractsJoin = injectsJoin.join("injectorContract", JoinType.LEFT);
    Expression<String[]> platformExpression =
        cb.function(
            "array_union_agg",
            String[].class,
            injectorsContractsJoin.get("platforms")
        );
    // SELECT
    cq.multiselect(
        scenarioRoot.get("id").alias("scenario_id"),
        scenarioRoot.get("name").alias("scenario_name"),
        scenarioRoot.get("severity").alias("scenario_severity"),
        scenarioRoot.get("category").alias("scenario_category"),
        scenarioRoot.get("recurrence").alias("scenario_recurrence"),
        scenarioRoot.get("updatedAt").alias("scenario_updated_at"),
        tagIdsExpression.alias("scenario_tags"),
        platformExpression.alias("scenario_platforms")
    ).distinct(true);
    // Group By
    cq.groupBy(scenarioRoot.get("id"));

    // -- Text Search and Filters --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(scenarioRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // -- Sorting --
    List<Order> orders = toSortCriteriaBuilder(cb, scenarioRoot, pageable.getSort());
    cq.orderBy(orders);

    // Type Query
    TypedQuery<Tuple> query = entityManager.createQuery(cq);

    // -- Pagination --
    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    // -- EXECUTION --
    List<RawPaginationScenario> scenarios = query.getResultList()
        .stream()
        .map(tuple -> new RawPaginationScenario(
            tuple.get("scenario_id", String.class),
            tuple.get("scenario_name", String.class),
            tuple.get("scenario_severity", Scenario.SEVERITY.class),
            tuple.get("scenario_category", String.class),
            tuple.get("scenario_recurrence", String.class),
            tuple.get("scenario_updated_at", Instant.class),
            tuple.get("scenario_tags", String[].class),
            tuple.get("scenario_platforms", String[].class)
        ))
        .toList();

    // -- Count Query --
    Long total = countQuery(cb, this.entityManager, Scenario.class, specification);

    return new PageImpl<>(scenarios, pageable, total);
  }

  /**
     * Scenario is recurring
     * AND start date is before now
     * AND end date is after now
   */
  public List<Scenario> recurringScenarios(@NotNull final Instant instant) {
    return this.scenarioRepository.findAll(
        ScenarioSpecification.isRecurring()
            .and(ScenarioSpecification.recurrenceStartDateBefore(instant))
            .and(ScenarioSpecification.recurrenceStopDateAfter(instant))
    );
  }

  /**
     * Scenario is recurring
     * AND
     * start date is before now
     * OR stop date is before now
   */
  public List<Scenario> potentialOutdatedRecurringScenario(@NotNull final Instant instant) {
    return this.scenarioRepository.findAll(
        ScenarioSpecification.isRecurring()
            .and(
                ScenarioSpecification.recurrenceStartDateBefore(instant)
                    .or(ScenarioSpecification.recurrenceStopDateBefore(instant))
            )
    );
  }

  public Scenario scenario(@NotBlank final String scenarioId) {
    return this.scenarioRepository.findById(scenarioId)
        .orElseThrow(() -> new ElementNotFoundException("Scenario not found"));
  }

  @Transactional(readOnly = true)
  public Exercise latestExerciseByExternalReference(@NotBlank final String scenarioExternalReference) {
    List<Scenario> scenarios = this.scenarioRepository.findByExternalReference(scenarioExternalReference);
    Optional<Exercise> latestEndedExercise = scenarios.stream()
        .flatMap(scenario -> scenario.getExercises().stream())
        .filter(exercise -> exercise.getEnd().isPresent())
        .max(Comparator.comparing(exercise -> exercise.getEnd().get()));
    if (latestEndedExercise.isPresent()) {
      return latestEndedExercise.get();
    } else {
      throw new ElementNotFoundException("Latest exercise not found");
    }
  }

  public Scenario updateScenario(@NotNull final Scenario scenario) {
    scenario.setUpdatedAt(now());
    return this.scenarioRepository.save(scenario);
  }

  public void updateScenarios(@NotNull final List<Scenario> scenarios) {
    scenarios.forEach(scenario -> scenario.setUpdatedAt(now()));
    this.scenarioRepository.saveAll(scenarios);
  }

  public void deleteScenario(@NotBlank final String scenarioId) {
    this.scenarioRepository.deleteById(scenarioId);
  }

  // -- EXPORT --

  public void exportScenario(
      @NotBlank final String scenarioId,
      final boolean isWithTeams,
      final boolean isWithPlayers,
      final boolean isWithVariableValues,
      HttpServletResponse response)
      throws IOException {
    ObjectMapper objectMapper = ObjectMapperHelper.openBASJsonMapper();
    Scenario scenario = this.scenario(scenarioId);

    // Start exporting scenario
    ScenarioFileExport scenarioFileExport = new ScenarioFileExport();
    scenarioFileExport.setVersion(1);
    // Add Scenario
    scenarioFileExport.setScenario(scenario);
    objectMapper.addMixIn(Scenario.class, ScenarioExportMixins.Scenario.class);
    List<Tag> scenarioTags = new ArrayList<>(scenario.getTags());
    // Add Objectives
    scenarioFileExport.setObjectives(scenario.getObjectives());
    objectMapper.addMixIn(Objective.class, ExerciseExportMixins.Objective.class);
    // Add Lesson Categories
    scenarioFileExport.setLessonsCategories(scenario.getLessonsCategories());
    objectMapper.addMixIn(LessonsCategory.class, ExerciseExportMixins.LessonsCategory.class);
    // Add Lessons Questions
    List<LessonsQuestion> lessonsQuestions = scenario.getLessonsCategories()
        .stream()
        .flatMap(category -> category.getQuestions().stream())
        .toList();
    scenarioFileExport.setLessonsQuestions(lessonsQuestions);
    objectMapper.addMixIn(LessonsQuestion.class, ExerciseExportMixins.LessonsQuestion.class);
    // Add Variables
    List<Variable> variables = this.variableService.variablesFromScenario(scenarioId);
    scenarioFileExport.setVariables(variables);
    if (isWithVariableValues) {
      objectMapper.addMixIn(Variable.class, VariableWithValueMixin.class);
    } else {
      objectMapper.addMixIn(Variable.class, VariableMixin.class);
    }

    // Add Documents
    scenarioFileExport.setDocuments(scenario.getDocuments());
    objectMapper.addMixIn(Document.class, ExerciseExportMixins.Document.class);
    scenarioTags.addAll(scenario.getDocuments().stream().flatMap(doc -> doc.getTags().stream()).toList());
    List<String> documentIds = new ArrayList<>(scenario.getDocuments().stream().map(Document::getId).toList());

    if (isWithTeams) {
      // Add Teams
      scenarioFileExport.setTeams(scenario.getTeams());
      objectMapper.addMixIn(Team.class,
          isWithPlayers ? ExerciseExportMixins.Team.class : ExerciseExportMixins.EmptyTeam.class);
      scenarioTags.addAll(scenario.getTeams().stream().flatMap(team -> team.getTags().stream()).toList());
    }

    if (isWithPlayers) {
      // Add players
      List<User> players = scenario.getTeams().stream().flatMap(team -> team.getUsers().stream()).distinct().toList();
      scenarioFileExport.setUsers(players);
      objectMapper.addMixIn(User.class, ExerciseExportMixins.User.class);
      scenarioTags.addAll(players.stream().flatMap(user -> user.getTags().stream()).toList());
      // organizations
      List<Organization> organizations = players.stream()
          .map(User::getOrganization)
          .filter(Objects::nonNull)
          .toList();
      scenarioFileExport.setOrganizations(organizations);
      objectMapper.addMixIn(Organization.class, ExerciseExportMixins.Organization.class);
      scenarioTags.addAll(organizations.stream().flatMap(org -> org.getTags().stream()).toList());
    } else {
      objectMapper.addMixIn(ExerciseFileExport.class, ScenarioExportMixins.ScenarioWithoutPlayers.class);
    }

    // Add Injects
    objectMapper.addMixIn(Inject.class, ExerciseExportMixins.Inject.class);
    scenarioFileExport.setInjects(scenario.getInjects());
    scenarioTags.addAll(scenario.getInjects().stream().flatMap(inject -> inject.getTags().stream()).toList());

    // Add Articles
    objectMapper.addMixIn(Article.class, ExerciseExportMixins.Article.class);
    scenarioFileExport.setArticles(scenario.getArticles());
    // Add Channels
    objectMapper.addMixIn(Channel.class, ExerciseExportMixins.Channel.class);
    List<Channel> channels = scenario.getArticles().stream().map(Article::getChannel).distinct().toList();
    scenarioFileExport.setChannels(channels);
    documentIds.addAll(
        channels.stream().flatMap(channel -> channel.getLogos().stream()).map(Document::getId).toList()
    );

    // Add Challenges
    objectMapper.addMixIn(Challenge.class, ExerciseExportMixins.Challenge.class);
    List<Challenge> challenges = fromIterable(this.challengeService.getScenarioChallenges(scenario));
    scenarioFileExport.setChallenges(challenges);
    scenarioTags.addAll(challenges.stream().flatMap(challenge -> challenge.getTags().stream()).toList());
    documentIds.addAll(
        challenges.stream().flatMap(challenge -> challenge.getDocuments().stream()).map(Document::getId).toList());

    // Tags
    scenarioFileExport.setTags(scenarioTags.stream().distinct().toList());
    objectMapper.addMixIn(Tag.class, ExerciseExportMixins.Tag.class);

    // Build the response
    String infos = "(" +
        (isWithTeams ? "with_teams" : "no_teams") +
        " & " +
        (isWithPlayers ? "with_players" : "no_players") +
        " & " +
        (isWithVariableValues ? "with_variable_values" : "no_variable_values")
        + ")";
    String zipName = (scenario.getName() + "_" + now().toString()) + "_" + infos + ".zip";
    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zipName);
    response.addHeader(HttpHeaders.CONTENT_TYPE, "application/zip");
    response.setStatus(HttpServletResponse.SC_OK);
    ZipOutputStream zipExport = new ZipOutputStream(response.getOutputStream());
    ZipEntry zipEntry = new ZipEntry(scenario.getName() + ".json");
    zipEntry.setComment(EXPORT_ENTRY_SCENARIO);
    zipExport.putNextEntry(zipEntry);
    zipExport.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(scenarioFileExport));
    zipExport.closeEntry();
    // Add the documents
    documentIds.stream().distinct().forEach(docId -> {
      Document doc = this.documentRepository.findById(docId).orElseThrow();
      Optional<InputStream> docStream = this.fileService.getFile(doc);
      if (docStream.isPresent()) {
        try {
          ZipEntry zipDoc = new ZipEntry(doc.getTarget());
          zipDoc.setComment(EXPORT_ENTRY_ATTACHMENT);
          byte[] data = docStream.get().readAllBytes();
          zipExport.putNextEntry(zipDoc);
          zipExport.write(data);
          zipExport.closeEntry();
        } catch (IOException e) {
          log.log(Level.SEVERE, e.getMessage(), e);
        }
      }
    });
    zipExport.finish();
    zipExport.close();
  }

  // -- TEAMS --

  public Iterable<Team> addTeams(@NotBlank final String scenarioId, @NotNull final List<String> teamIds) {
    Scenario scenario = this.scenario(scenarioId);
    List<Team> teams = scenario.getTeams();
    List<Team> teamsToAdd = fromIterable(this.teamRepository.findAllById(teamIds));
    List<String> existingTeamIds = teams.stream().map(Team::getId).toList();
    teams.addAll(teamsToAdd.stream().filter(t -> !existingTeamIds.contains(t.getId())).toList());
    scenario.setTeams(teams);
    scenario.setUpdatedAt(now());
    return teamsToAdd;
  }

  public Iterable<Team> removeTeams(@NotBlank final String scenarioId, @NotNull final List<String> teamIds) {
    Scenario scenario = this.scenario(scenarioId);
    List<Team> teams = scenario.getTeams().stream().filter(team -> !teamIds.contains(team.getId())).toList();
    scenario.setTeams(new ArrayList<>(teams));
    this.updateScenario(scenario);
    // Remove all association between users / exercises / teams
    teamIds.forEach(this.scenarioTeamUserRepository::deleteTeamFromAllReferences);
    return teamRepository.findAllById(teamIds);
  }

  public Scenario enablePlayers(@NotBlank final String scenarioId, @NotBlank final String teamId,
      @NotNull final List<String> playerIds) {
    Scenario scenario = this.scenario(scenarioId);
    Team team = this.teamRepository.findById(teamId).orElseThrow();
    playerIds.forEach(playerId -> {
      ScenarioTeamUser scenarioTeamUser = new ScenarioTeamUser();
      scenarioTeamUser.setScenario(scenario);
      scenarioTeamUser.setTeam(team);
      scenarioTeamUser.setUser(this.userRepository.findById(playerId).orElseThrow());
      this.scenarioTeamUserRepository.save(scenarioTeamUser);
    });
    return scenario;
  }

  public Scenario disablePlayers(@NotBlank final String scenarioId, @NotBlank final String teamId,
      @NotNull final List<String> playerIds) {
    playerIds.forEach(playerId -> {
      ScenarioTeamUserId scenarioTeamUserId = new ScenarioTeamUserId();
      scenarioTeamUserId.setScenarioId(scenarioId);
      scenarioTeamUserId.setTeamId(teamId);
      scenarioTeamUserId.setUserId(playerId);
      this.scenarioTeamUserRepository.deleteById(scenarioTeamUserId);
    });
    return this.scenario(scenarioId);
  }

  @Transactional
  public Scenario getDuplicateScenario(@NotBlank String scenarioId) {
    if (StringUtils.isNotBlank(scenarioId)) {
      Scenario scenarioOrigin = scenarioRepository.findById(scenarioId).orElseThrow();
      Scenario scenario = copyScenario(scenarioOrigin);
      Scenario scenarioDuplicate = scenarioRepository.save(scenario);
      getListOfDuplicatedInjects(scenarioDuplicate, scenarioOrigin);
      getListOfScenarioTeams(scenarioDuplicate, scenarioOrigin);
      getListOfArticles(scenarioDuplicate, scenarioOrigin);
      getListOfVariables(scenarioDuplicate, scenarioOrigin);
      getObjectives(scenarioDuplicate, scenarioOrigin);
      getLessonsCategories(scenarioDuplicate, scenarioOrigin);
      return scenarioRepository.save(scenario);
    }
    throw new ElementNotFoundException();
  }

  private void getListOfScenarioTeams(@NotNull Scenario scenario, @NotNull Scenario scenarioOrigin) {
    Map<String, Team> contextualTeams = new HashMap<>();
    List<Team> scenarioTeams = new ArrayList<>();
    scenarioOrigin.getTeams().forEach(scenarioTeam -> {
      if (scenarioTeam.getContextual()) {
        Team team = teamService.copyContextualTeam(scenarioTeam);
        Team teamSaved = this.teamRepository.save(team);
        scenarioTeams.add(teamSaved);
        contextualTeams.put(scenarioTeam.getId(), teamSaved);
      } else {
        scenarioTeams.add(scenarioTeam);
      }
    });
    scenario.setTeams(new ArrayList<>(scenarioTeams));

    List<Inject> scenarioInjects = scenario.getInjects();
    scenarioInjects.forEach(scenarioInject -> {
      List<Team> teams = new ArrayList<>();
      scenarioInject.getTeams().forEach(team -> {
        if (team.getContextual()) {
          teams.add(contextualTeams.get(team.getId()));
        } else {
          teams.add(team);
        }
      });
      scenarioInject.setTeams(teams);
    });
  }

  private Scenario copyScenario(Scenario scenario) {
    Scenario scenarioDuplicate = new Scenario();
    scenarioDuplicate.setName(duplicateString(scenario.getName()));
    scenarioDuplicate.setCategory(scenario.getCategory());
    scenarioDuplicate.setDescription(scenario.getDescription());
    scenarioDuplicate.setSeverity(scenario.getSeverity());
    scenarioDuplicate.setSubtitle(scenario.getSubtitle());
    scenarioDuplicate.setHeader(scenario.getHeader());
    scenarioDuplicate.setMainFocus(scenario.getMainFocus());
    scenarioDuplicate.setFrom(scenario.getFrom());
    scenarioDuplicate.setExternalUrl(scenario.getExternalUrl());
    scenarioDuplicate.setTags(new HashSet<>(scenario.getTags()));
    scenarioDuplicate.setInjects(new HashSet<>(scenario.getInjects()));
    scenarioDuplicate.setExternalReference(scenario.getExternalReference());
    scenarioDuplicate.setTeamUsers(new ArrayList<>(scenario.getTeamUsers()));
    scenarioDuplicate.setReplyTos(new ArrayList<>(scenario.getReplyTos()));
    scenarioDuplicate.setLessonsAnonymized(scenario.isLessonsAnonymized());
    scenarioDuplicate.setDocuments(new ArrayList<>(scenario.getDocuments()));
    scenarioDuplicate.setGrants(new ArrayList<>(scenario.getGrants()));
    return scenarioDuplicate;
  }

  private void getListOfDuplicatedInjects(@NotNull Scenario scenario, @NotNull Scenario scenarioOrign) {
    Set<Inject> injectListForScenario = scenarioOrign.getInjects()
        .stream().map(inject -> injectDuplicateService.createInjectForScenario(scenario.getId(), inject.getId(), false))
        .collect(Collectors.toSet());
    scenario.setInjects(new HashSet<>(injectListForScenario));
  }

  private void getListOfArticles(@NotNull Scenario scenario, @NotNull Scenario scenarioOrign) {
    Map<String, String> mapIdArticleOriginNew = new HashMap<>();
    List<Article> articleList = new ArrayList<>();
    scenarioOrign.getArticles().forEach(article -> {
      Article scenarioArticle = new Article();
      scenarioArticle.setName(article.getName());
      scenarioArticle.setContent(article.getContent());
      scenarioArticle.setAuthor(article.getAuthor());
      scenarioArticle.setShares(article.getShares());
      scenarioArticle.setLikes(article.getLikes());
      scenarioArticle.setComments(article.getComments());
      scenarioArticle.setChannel(article.getChannel());
      scenarioArticle.setDocuments(new ArrayList<>(article.getDocuments()));
      scenarioArticle.setScenario(scenario);
      Article save = articleRepository.save(scenarioArticle);
      articleList.add(save);
      mapIdArticleOriginNew.put(article.getId(), scenarioArticle.getId());
    });
    scenario.setArticles(articleList);
    for (Inject inject : scenario.getInjects()) {
      if (ofNullable(inject.getContent()).map(c -> c.has(ARTICLES)).orElse(Boolean.FALSE)) {
        List<String> articleNode = new ArrayList<>();
        JsonNode articles = inject.getContent().findValue(ARTICLES);
        if (articles.isArray()) {
          for (final JsonNode node : articles) {
            if (mapIdArticleOriginNew.containsKey(node.textValue())) {
              articleNode.add(mapIdArticleOriginNew.get(node.textValue()));
            }
          }
        }
        inject.getContent().remove(ARTICLES);
        ArrayNode arrayNode = inject.getContent().putArray(ARTICLES);
        articleNode.forEach(arrayNode::add);
      }
    }
  }

  private void getListOfVariables(Scenario scenario, Scenario scenarioOrigin) {
    List<Variable> variables = variableService.variablesFromScenario(scenarioOrigin.getId());
    List<Variable> variableList = variables.stream().map(variable -> {
      Variable variable1 = new Variable();
      variable1.setKey(variable.getKey());
      variable1.setDescription(variable.getDescription());
      variable1.setValue(variable.getValue());
      variable1.setType(variable.getType());
      variable1.setScenario(scenario);
      return variable1;
    }).toList();
    variableService.createVariables(variableList);
  }

  private void getLessonsCategories(Scenario duplicatedScenario, Scenario originalScenario){
    List<LessonsCategory> duplicatedCategories = new ArrayList<>();
    for (LessonsCategory originalCategory : originalScenario.getLessonsCategories()) {
      LessonsCategory duplicatedCategory = new LessonsCategory();
      duplicatedCategory.setName(originalCategory.getName());
      duplicatedCategory.setDescription(originalCategory.getDescription());
      duplicatedCategory.setOrder(originalCategory.getOrder());
      duplicatedCategory.setScenario(duplicatedScenario);
      duplicatedCategory.setTeams(new ArrayList<>(originalCategory.getTeams()));

      List<LessonsQuestion> duplicatedQuestions = new ArrayList<>();
      for (LessonsQuestion originalQuestion : originalCategory.getQuestions()) {
        LessonsQuestion duplicatedQuestion = new LessonsQuestion();
        duplicatedQuestion.setCategory(originalQuestion.getCategory());
        duplicatedQuestion.setContent(originalQuestion.getContent());
        duplicatedQuestion.setExplanation(originalQuestion.getExplanation());
        duplicatedQuestion.setOrder(originalQuestion.getOrder());
        duplicatedQuestion.setCategory(duplicatedCategory);

        List<LessonsAnswer> duplicatedAnswers = new ArrayList<>();
        for (LessonsAnswer originalAnswer : originalQuestion.getAnswers()) {
          LessonsAnswer duplicatedAnswer = new LessonsAnswer();
          duplicatedAnswer.setUser(originalAnswer.getUser());
          duplicatedAnswer.setScore(originalAnswer.getScore());
          duplicatedAnswer.setPositive(originalAnswer.getPositive());
          duplicatedAnswer.setNegative(originalAnswer.getNegative());
          duplicatedAnswer.setQuestion(duplicatedQuestion);
          duplicatedAnswers.add(duplicatedAnswer);
        }
        duplicatedQuestion.setAnswers(duplicatedAnswers);
        duplicatedQuestions.add(duplicatedQuestion);
      }
      duplicatedCategory.setQuestions(duplicatedQuestions);
      duplicatedCategories.add(duplicatedCategory);
    }
    duplicatedScenario.setLessonsCategories(duplicatedCategories);
  }

  private void getObjectives(Scenario scenario, Scenario scenarioOrigin){
    List<Objective> duplicatedObjectives = new ArrayList<>();
    for (Objective originalObjective : scenarioOrigin.getObjectives()) {
      Objective duplicatedObjective = new Objective();
      duplicatedObjective.setTitle(originalObjective.getTitle());
      duplicatedObjective.setDescription(originalObjective.getDescription());
      duplicatedObjective.setPriority(originalObjective.getPriority());
      List<Evaluation> duplicatedEvaluations = new ArrayList<>();
      for (Evaluation originalEvaluation : originalObjective.getEvaluations()) {
        Evaluation duplicatedEvaluation = new Evaluation();
        duplicatedEvaluation.setScore(originalEvaluation.getScore());
        duplicatedEvaluation.setUser(originalEvaluation.getUser());
        duplicatedEvaluation.setObjective(duplicatedObjective);
        duplicatedEvaluations.add(duplicatedEvaluation);
      }
      duplicatedObjective.setEvaluations(duplicatedEvaluations);
      duplicatedObjective.setScenario(scenario);
      duplicatedObjectives.add(duplicatedObjective);
    }
    scenario.setObjectives(duplicatedObjectives);
  }

}
