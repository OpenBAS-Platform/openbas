package io.openbas.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.injectors.challenge.model.ChallengeContent;
import io.openbas.injectors.channel.model.ChannelContent;
import io.openbas.rest.exercise.exports.VariableWithValueMixin;
import io.openbas.service.FileService;
import io.openbas.service.ImportEntry;
import io.openbas.service.ScenarioService;
import jakarta.activation.MimetypesFileTypeMap;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.rest.exercise.exports.ExerciseFileExport.EXERCISE_VARIABLES;
import static io.openbas.rest.scenario.export.ScenarioFileExport.SCENARIO_VARIABLES;
import static java.util.Optional.ofNullable;
import static org.springframework.util.StringUtils.hasText;

@Component
public class V1_DataImporter implements Importer {

  // region variables
  @Resource
  protected ObjectMapper mapper;
  private FileService documentService;
  private DocumentRepository documentRepository;
  private TagRepository tagRepository;
  private ExerciseRepository exerciseRepository;
  private ScenarioService scenarioService;
  private TeamRepository teamRepository;
  private ObjectiveRepository objectiveRepository;
  private InjectRepository injectRepository;
  private OrganizationRepository organizationRepository;
  private UserRepository userRepository;
  private InjectDocumentRepository injectDocumentRepository;
  private ChallengeRepository challengeRepository;
  private ChannelRepository channelRepository;
  private ArticleRepository articleRepository;
  private LessonsCategoryRepository lessonsCategoryRepository;
  private LessonsQuestionRepository lessonsQuestionRepository;
  private VariableRepository variableRepository;
  // endregion

  // region setter
  @Autowired
  public void setLessonsQuestionRepository(LessonsQuestionRepository lessonsQuestionRepository) {
    this.lessonsQuestionRepository = lessonsQuestionRepository;
  }

  @Autowired
  public void setLessonsCategoryRepository(LessonsCategoryRepository lessonsCategoryRepository) {
    this.lessonsCategoryRepository = lessonsCategoryRepository;
  }

  @Autowired
  public void setArticleRepository(ArticleRepository articleRepository) {
    this.articleRepository = articleRepository;
  }

  @Autowired
  public void setChannelRepository(ChannelRepository channelRepository) {
    this.channelRepository = channelRepository;
  }

  @Autowired
  public void setChallengeRepository(ChallengeRepository challengeRepository) {
    this.challengeRepository = challengeRepository;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  public void setOrganizationRepository(OrganizationRepository organizationRepository) {
    this.organizationRepository = organizationRepository;
  }

  @Autowired
  public void setDocumentRepository(DocumentRepository documentRepository) {
    this.documentRepository = documentRepository;
  }

  @Autowired
  public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {
    this.injectDocumentRepository = injectDocumentRepository;
  }

  @Autowired
  public void setDocumentService(FileService documentService) {
    this.documentService = documentService;
  }

  @Autowired
  public void setObjectiveRepository(ObjectiveRepository objectiveRepository) {
    this.objectiveRepository = objectiveRepository;
  }

  @Autowired
  public void setInjectRepository(InjectRepository injectRepository) {
    this.injectRepository = injectRepository;
  }

  @Autowired
  public void setExerciseRepository(ExerciseRepository exerciseRepository) {
    this.exerciseRepository = exerciseRepository;
  }

  @Autowired
  public void setScenarioService(final ScenarioService scenarioService) {
    this.scenarioService = scenarioService;
  }

  @Autowired
  public void setTeamRepository(TeamRepository teamRepository) {
    this.teamRepository = teamRepository;
  }

  @Autowired
  public void setTagRepository(TagRepository tagRepository) {
    this.tagRepository = tagRepository;
  }

  @Autowired
  public void setVariableRepository(@NotNull final VariableRepository variableRepository) {
    this.variableRepository = variableRepository;
  }
  // endregion

  private String handleInjectContent(Map<String, Base> baseIds, String contract, JsonNode injectNode) {
    if (contract == null) {
      return null;
    }
    String content = injectNode.get("inject_content").toString();
    switch (contract) {
      // Challenges exists in exercise only through inject content definition
      // So we need to rewrite content for challenges to remap the challenge ids
      case CHALLENGE_PUBLISH -> {
        try {
          JsonNode jsonNode = mapper.readTree(content);
          ChallengeContent challengeContent = mapper.treeToValue(jsonNode, ChallengeContent.class);
          List<String> remappedIds = challengeContent.getChallenges().stream()
              .map(baseIds::get).filter(Objects::nonNull).map(Base::getId).toList();
          challengeContent.setChallenges(remappedIds);
          content = mapper.writeValueAsString(challengeContent);
        } catch (Exception e) {
          // Error rewriting content, inject cant be created
          return null;
        }
      }
      // Channel articles exists in exercise only through inject content definition
      // So we need to rewrite content for channels to remap the channel ids
      case CHANNEL_PUBLISH -> {
        try {
          JsonNode jsonNode = mapper.readTree(content);
          ChannelContent channelContent = mapper.treeToValue(jsonNode, ChannelContent.class);
          List<String> remappedIds = channelContent.getArticles().stream()
              .map(baseIds::get).filter(Objects::nonNull).map(Base::getId).toList();
          channelContent.setArticles(remappedIds);
          content = mapper.writeValueAsString(channelContent);
        } catch (Exception e) {
          // Error rewriting content, inject cant be created
          return null;
        }
      }
    }
    return content;
  }

  private void importInjects(Map<String, Base> baseIds, String exerciseId, String scenarioId, List<JsonNode> injects) {
    List<String> injected = new ArrayList<>();
    injects.forEach(injectNode -> {
      String injectId = UUID.randomUUID().toString();
      injected.add(injectId);
      String id = injectNode.get("inject_id").textValue();
      String title = injectNode.get("inject_title").textValue();
      String description = injectNode.get("inject_description").textValue();
      String country = injectNode.get("inject_country").textValue();
      String city = injectNode.get("inject_city").textValue();
      String injectorContractId = null;
      JsonNode injectContractNode = injectNode.get("inject_injector_contract");
      if (injectContractNode != null) {
        injectorContractId = injectContractNode.get("injector_contract_id").textValue();
      }
      // If contract is not know, inject can't be imported
      String content = handleInjectContent(baseIds, injectorContractId, injectNode);
      JsonNode dependsOnNode = injectNode.get("inject_depends_on");
      String dependsOn = !dependsOnNode.isNull() ? baseIds.get(dependsOnNode.asText()).getId() : null;
      Long dependsDuration = injectNode.get("inject_depends_duration").asLong();
      boolean allTeams = injectNode.get("inject_all_teams").booleanValue();
      if (hasText(exerciseId)) {
        injectRepository.importSaveForExercise(injectId, title, description, country, city, injectorContractId, allTeams,
            true, exerciseId, dependsOn, dependsDuration, content);
      } else if (hasText(scenarioId)) {
        injectRepository.importSaveForScenario(injectId, title, description, country, city, injectorContractId, allTeams,
            true, scenarioId, dependsOn, dependsDuration, content);
      }
      baseIds.put(id, new BaseHolder(injectId));
      // Tags
      List<String> injectTagIds = resolveJsonIds(injectNode, "inject_tags");
      injectTagIds.forEach(tagId -> {
        String remappedId = baseIds.get(tagId).getId();
        injectRepository.addTag(injectId, remappedId);
      });
      // Teams
      List<String> injectTeamIds = resolveJsonIds(injectNode, "inject_teams");
      injectTeamIds.forEach(teamId -> {
        String remappedId = baseIds.get(teamId).getId();
        injectRepository.addTeam(injectId, remappedId);
      });
      // Documents
      List<JsonNode> injectDocuments = resolveJsonElements(injectNode, "inject_documents").toList();
      injectDocuments.forEach(jsonNode -> {
        String docId = jsonNode.get("document_id").textValue();
        String documentId = baseIds.get(docId).getId();
        boolean docAttached = jsonNode.get("document_attached").booleanValue();
        injectDocumentRepository.addInjectDoc(injectId, documentId, docAttached);
      });
    });
    // Looking for child of created injects
    List<JsonNode> childInjects = injects.stream().filter(jsonNode -> {
      String injectDependsOn = jsonNode.get("inject_depends_on").asText();
      return injected.contains(injectDependsOn);
    }).toList();
    if (!childInjects.isEmpty()) {
      importInjects(baseIds, exerciseId, scenarioId, childInjects);
    }
  }

  private List<Tag> computeTagsCompletion(List<Tag> existingTags, List<String> lookingIds, Map<String, Base> baseIds) {
    List<Tag> tags = new ArrayList<>(existingTags);
    List<Tag> tagsForOrganization = lookingIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
    tagsForOrganization.forEach(inputTag -> {
      if (!tags.contains(inputTag)) {
        tags.add(inputTag);
      }
    });
    return tags;
  }

  @Override
  public void importData(JsonNode importNode, Map<String, ImportEntry> docReferences) {
    Map<String, Base> baseIds = new HashMap<>();
    final String prefix = importNode.get("exercise_information") != null ? "exercise_"
        : "scenario_"; // Used to defined prefix for retrieving fields: exercise_ or scenario_

    // ------------ Handling tags
    Stream<JsonNode> tagsStream = resolveJsonElements(importNode, prefix + "tags");
    Stream<Tag> tagImportStream = tagsStream.map(jsonNode -> {
      Tag tag = new Tag();
      tag.setId(jsonNode.get("tag_id").textValue());
      tag.setName(jsonNode.get("tag_name").textValue());
      tag.setColor(jsonNode.get("tag_color").textValue());
      return tag;
    });
    Map<String, Tag> existingTagsByName = fromIterable(tagRepository.findAll()).stream().collect(
        Collectors.toMap(Tag::getName, Function.identity()));
    tagImportStream.forEach(tag -> {
      if (existingTagsByName.containsKey(tag.getName())) {
        baseIds.put(tag.getId(), existingTagsByName.get(tag.getName()));
      } else {
        Tag savedTag = tagRepository.save(tag);
        baseIds.put(tag.getId(), savedTag);
      }
    });

    // ------------ Handling exercise
    JsonNode exerciseNode = importNode.get("exercise_information");
    Exercise savedExercise;
    if (exerciseNode != null) {
      Exercise exercise = new Exercise();
      exercise.setName(exerciseNode.get("exercise_name").textValue() + " (Import)");
      exercise.setDescription(exerciseNode.get("exercise_description").textValue());
      exercise.setSubtitle(exerciseNode.get("exercise_subtitle").textValue());
      exercise.setHeader(exerciseNode.get("exercise_message_header").textValue());
      exercise.setFooter(exerciseNode.get("exercise_message_footer").textValue());
      exercise.setFrom(exerciseNode.get("exercise_mail_from").textValue());
      List<String> exerciseTagIds = resolveJsonIds(exerciseNode, "exercise_tags");
      List<Tag> tagsForExercise = exerciseTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
      exercise.setTags(tagsForExercise);
      savedExercise = this.exerciseRepository.save(exercise);
    } else {
      savedExercise = null;
    }

    // ------------ Handling scenario
    JsonNode scenarioNode = importNode.get("scenario_information");
    Scenario savedScenario;
    if (scenarioNode != null) {
      Scenario scenario = new Scenario();
      scenario.setName(scenarioNode.get("scenario_name").textValue() + " (Import)");
      scenario.setDescription(scenarioNode.get("scenario_description").textValue());
      scenario.setSubtitle(scenarioNode.get("scenario_subtitle").textValue());
      scenario.setCategory(scenarioNode.get("scenario_category").textValue());
      scenario.setMainFocus(scenarioNode.get("scenario_main_focus").textValue());
      scenario.setSeverity(scenarioNode.get("scenario_severity").textValue());
      scenario.setRecurrence(scenarioNode.get("scenario_recurrence").textValue());
      String recurrenceStart = scenarioNode.get("scenario_recurrence_start").textValue();
      if (hasText(recurrenceStart)) {
        scenario.setRecurrenceStart(Instant.parse(recurrenceStart));
      }
      String recurrenceEnd = scenarioNode.get("scenario_recurrence_end").textValue();
      if (hasText(recurrenceEnd)) {
        scenario.setRecurrenceEnd(Instant.parse(recurrenceEnd));
      }
      scenario.setHeader(scenarioNode.get("scenario_message_header").textValue());
      scenario.setFooter(scenarioNode.get("scenario_message_footer").textValue());
      scenario.setFrom(scenarioNode.get("scenario_mail_from").textValue());
      List<String> scenarioTagIds = resolveJsonIds(scenarioNode, "scenario_tags");
      List<Tag> tagsForScenarios = scenarioTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
      scenario.setTags(tagsForScenarios);
      savedScenario = this.scenarioService.createScenario(scenario);
    } else {
      savedScenario = null;
    }

    // ------------ Handling documents
    Stream<JsonNode> documentsStream = resolveJsonElements(importNode, prefix + "documents");
    documentsStream.forEach(nodeDoc -> {
      String id = nodeDoc.get("document_id").textValue();
      String name = nodeDoc.get("document_name").textValue();
      String description = nodeDoc.get("document_description").textValue();
      String target = nodeDoc.get("document_target").textValue();
      List<String> documentTagIds = resolveJsonIds(nodeDoc, "document_tags");
      ImportEntry entry = docReferences.get(target);
      if (entry != null) {
        String contentType = new MimetypesFileTypeMap().getContentType(entry.getEntry().getName());
        Optional<Document> targetDocument = documentRepository.findByTarget(target);
        if (targetDocument.isPresent()) {
          Document document = targetDocument.get();
          // Compute exercises
          if (savedExercise != null) {
            List<Exercise> exercises = new ArrayList<>(document.getExercises());
            if (!exercises.contains(savedExercise)) {
              exercises.add(savedExercise);
            }
            document.setExercises(exercises);
          }
          // Compute scenario
          else if (savedScenario != null) {
            List<Scenario> scenarios = new ArrayList<>(document.getScenarios());
            if (!scenarios.contains(savedScenario)) {
              scenarios.add(savedScenario);
            }
            document.setScenarios(scenarios);
          }
          // Compute tags
          document.setTags(computeTagsCompletion(document.getTags(), documentTagIds, baseIds));
          Document savedDocument = documentRepository.save(document);
          baseIds.put(id, savedDocument);
        } else {
          try {
            documentService.uploadFile(target, entry.getData(), entry.getEntry().getSize(), contentType);
          } catch (Exception e) {
            throw new ImportException(e);
          }
          Document document = new Document();
          document.setTarget(target);
          document.setName(name);
          document.setDescription(description);
          if (savedExercise != null) {
            document.setExercises(List.of(savedExercise));
          } else if (savedScenario != null) {
            document.setScenarios(List.of(savedScenario));
          }
          document.setTags(fromIterable(tagRepository.findAllById(documentTagIds)));
          document.setType(contentType);
          Document savedDocument = documentRepository.save(document);
          baseIds.put(id, savedDocument);
        }
      }
    });

    // ------------ Handling organizations
    if (importNode.get(prefix + "organizations") != null) {
      Stream<JsonNode> organizationsStream = resolveJsonElements(importNode, prefix + "organizations");
      Map<String, Organization> existingOrganizationsByName = fromIterable(organizationRepository.findAll()).stream()
          .collect(Collectors.toMap(Organization::getName, Function.identity()));
      organizationsStream.forEach(nodeOrganization -> {
        String id = nodeOrganization.get("organization_id").textValue();
        String name = nodeOrganization.get("organization_name").textValue();
        String description = nodeOrganization.get("organization_description").textValue();
        List<String> organizationTagIds = resolveJsonIds(nodeOrganization, "organization_tags");
        if (existingOrganizationsByName.containsKey(name)) {
          Organization organization = existingOrganizationsByName.get(name);
          organization.setTags(computeTagsCompletion(organization.getTags(), organizationTagIds, baseIds));
          Organization savedOrganization = organizationRepository.save(organization);
          baseIds.put(id, savedOrganization);
        } else {
          Organization organization = new Organization();
          organization.setName(name);
          organization.setDescription(description);
          organization.setTags(computeTagsCompletion(List.of(), organizationTagIds, baseIds));
          Organization savedOrganization = organizationRepository.save(organization);
          baseIds.put(id, savedOrganization);
        }
      });
    }

    // ------------ Handling users
    if (importNode.get(prefix + "users") != null) {
      Map<String, User> existingUsersByEmail = fromIterable(userRepository.findAll()).stream().collect(
          Collectors.toMap(User::getEmail, Function.identity()));
      Stream<JsonNode> usersStream = resolveJsonElements(importNode, prefix + "users");
      usersStream.forEach(nodeUser -> {
        String id = nodeUser.get("user_id").textValue();
        String email = nodeUser.get("user_email").textValue();
        String firstname = nodeUser.get("user_firstname").textValue();
        String lastname = nodeUser.get("user_lastname").textValue();
        String lang = nodeUser.get("user_lang").textValue();
        String phone = nodeUser.get("user_phone").textValue();
        String pgpKey = nodeUser.get("user_pgp_key").textValue();
        String organizationId = nodeUser.get("user_organization").textValue();
        String country = nodeUser.get("user_country").textValue();
        String city = nodeUser.get("user_city").textValue();
        List<String> userTagIds = resolveJsonIds(nodeUser, "user_tags");
        if (existingUsersByEmail.containsKey(email)) {
          User user = existingUsersByEmail.get(email);
          user.setTags(computeTagsCompletion(user.getTags(), userTagIds, baseIds));
          User savedUser = userRepository.save(user);
          baseIds.put(id, savedUser);
        } else {
          User user = new User();
          user.setEmail(email);
          user.setFirstname(firstname);
          user.setLastname(lastname);
          user.setLang(lang);
          user.setPhone(phone);
          user.setPgpKey(pgpKey);
          user.setPhone(phone);
          Base userOrganization = baseIds.get(organizationId);
          if (userOrganization != null) {
            user.setOrganization((Organization) userOrganization);
          }
          user.setCountry(country);
          user.setCity(city);
          user.setTags(computeTagsCompletion(List.of(), userTagIds, baseIds));
          User savedUser = userRepository.save(user);
          baseIds.put(id, savedUser);
        }
      });
    }

    // ------------ Handling teams
    Stream<JsonNode> teamsStream = resolveJsonElements(importNode, prefix + "teams");
    Map<String, Team> baseTeams = handlingTeams(teamsStream, baseIds);
    baseTeams.values().forEach((team) -> {
      if (savedExercise != null) {
        team.getExercises().add(savedExercise);
      } else if (savedScenario != null) {
        team.getScenarios().add(savedScenario);
      }
    });
    baseIds.putAll(baseTeams);

    // ------------ Handling challenges
    Stream<JsonNode> challengesStream = resolveJsonElements(importNode, prefix + "challenges");
    challengesStream.forEach(nodeChallenge -> {
      String id = nodeChallenge.get("challenge_id").textValue();
      String challengeName = nodeChallenge.get("challenge_name").textValue();
      // Prevent duplication of challenge, based on the challenge name
      List<Challenge> existingChallenges = challengeRepository.findByNameIgnoreCase(challengeName);
      if (existingChallenges.size() == 1) {
        baseIds.put(id, existingChallenges.get(0));
      } else {
        Challenge challenge = new Challenge();
        challenge.setName(challengeName);
        challenge.setCategory(nodeChallenge.get("challenge_category").textValue());
        challenge.setContent(nodeChallenge.get("challenge_content").textValue());
        challenge.setScore(nodeChallenge.get("challenge_score").asInt(0));
        challenge.setMaxAttempts(nodeChallenge.get("challenge_max_attempts").asInt(0));
        // Documents
        List<Document> challengeDocuments = resolveJsonIds(nodeChallenge, "challenge_documents")
            .stream().map(docId -> (Document) baseIds.get(docId))
            .filter(Objects::nonNull)
            .toList();
        challenge.setDocuments(challengeDocuments);
        // Flags
        List<ChallengeFlag> flags = new ArrayList<>();
        Stream<JsonNode> challengeFlags = resolveJsonElements(nodeChallenge, "challenge_flags");
        challengeFlags.forEach(flagNode -> {
          ChallengeFlag flag = new ChallengeFlag();
          flag.setValue(flagNode.get("flag_value").textValue());
          flag.setType(ChallengeFlag.FLAG_TYPE.valueOf(flagNode.get("flag_type").textValue()));
          flag.setChallenge(challenge);
          flags.add(flag);
        });
        challenge.setFlags(flags);
        // Tags
        List<String> challengeTagIds = resolveJsonIds(nodeChallenge, "challenge_tags");
        List<Tag> tagsForChallenge = challengeTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
        challenge.setTags(tagsForChallenge);
        Challenge savedChallenge = challengeRepository.save(challenge);
        baseIds.put(id, savedChallenge);
      }
    });

    // ------------ Handling channels
    Stream<JsonNode> channelsStream = resolveJsonElements(importNode, prefix + "channels");
    channelsStream.forEach(nodeChannel -> {
      String id = nodeChannel.get("channel_id").textValue();
      String channelName = nodeChannel.get("channel_name").textValue();
      // Prevent duplication of channel, based on the channel name
      List<Channel> existingChannels = channelRepository.findByNameIgnoreCase(channelName);
      if (existingChannels.size() == 1) {
        baseIds.put(id, existingChannels.get(0));
      } else {
        Channel channel = new Channel();
        channel.setName(channelName);
        channel.setType(nodeChannel.get("channel_type").textValue());
        channel.setDescription(nodeChannel.get("channel_description").textValue());
        channel.setMode(nodeChannel.get("channel_mode").textValue());
        channel.setPrimaryColorDark(nodeChannel.get("channel_primary_color_dark").textValue());
        channel.setPrimaryColorLight(nodeChannel.get("channel_primary_color_light").textValue());
        channel.setSecondaryColorDark(nodeChannel.get("channel_secondary_color_dark").textValue());
        channel.setSecondaryColorLight(nodeChannel.get("channel_secondary_color_light").textValue());
        String channelLogoDark = nodeChannel.get("channel_logo_dark").textValue();
        if (channelLogoDark != null) {
          channel.setLogoDark((Document) baseIds.get(channelLogoDark));
        }
        String channelLogoLight = nodeChannel.get("channel_logo_light").textValue();
        if (channelLogoLight != null) {
          channel.setLogoLight((Document) baseIds.get(channelLogoLight));
        }
        Channel savedChannel = channelRepository.save(channel);
        baseIds.put(id, savedChannel);
      }
    });

    // ------------ Handling articles
    Stream<JsonNode> articlesStream = resolveJsonElements(importNode, prefix + "articles");
    articlesStream.forEach(nodeArticle -> {
      String id = nodeArticle.get("article_id").textValue();
      Article article = new Article();
      article.setName(nodeArticle.get("article_name").textValue());
      article.setContent(nodeArticle.get("article_content").textValue());
      article.setAuthor(nodeArticle.get("article_author").textValue());
      article.setShares(nodeArticle.get("article_shares").intValue());
      article.setLikes(nodeArticle.get("article_likes").intValue());
      article.setComments(nodeArticle.get("article_comments").intValue());
      if (savedExercise != null) {
        article.setExercise(savedExercise);
      } else if (savedScenario != null) {
        article.setScenario(savedScenario);
      }
      // Documents
      List<Document> articleDocuments = resolveJsonIds(nodeArticle, "article_documents")
          .stream().map(docId -> (Document) baseIds.get(docId))
          .filter(Objects::nonNull)
          .toList();
      article.setDocuments(articleDocuments);
      String articleChannelId = nodeArticle.get("article_channel").textValue();
      Channel articleChannel = (Channel) baseIds.get(articleChannelId);
      article.setChannel(articleChannel);
      Article savedArticle = articleRepository.save(article);
      baseIds.put(id, savedArticle);
    });

    // ------------ Handling objectives
    Stream<JsonNode> objectivesStream = resolveJsonElements(importNode, prefix + "objectives");
    objectivesStream.forEach(nodeObjective -> {
      String id = nodeObjective.get("objective_id").textValue();
      Objective objective = new Objective();
      objective.setTitle(nodeObjective.get("objective_title").textValue());
      objective.setDescription(nodeObjective.get("objective_description").textValue());
      objective.setPriority((short) nodeObjective.get("objective_priority").asInt(0));
      if (savedExercise != null) {
        objective.setExercise(savedExercise);
      } else if (savedScenario != null) {
        objective.setScenario(savedScenario);
      }
      Objective savedObjective = objectiveRepository.save(objective);
      baseIds.put(id, savedObjective);
    });

    // ------------ Handling lessons
    Stream<JsonNode> lessonsCategoriesStream = resolveJsonElements(importNode, prefix + "lessons_categories");
    lessonsCategoriesStream.forEach(nodeLessonCategory -> {
      String id = nodeLessonCategory.get("lessonscategory_id").textValue();
      LessonsCategory lessonsCategory = new LessonsCategory();
      lessonsCategory.setName(nodeLessonCategory.get("lessons_category_name").textValue());
      lessonsCategory.setDescription(nodeLessonCategory.get("lessons_category_description").textValue());
      lessonsCategory.setOrder(nodeLessonCategory.get("lessons_category_order").intValue());
      if (savedExercise != null) {
        lessonsCategory.setExercise(savedExercise);
      } else if (savedScenario != null) {
        lessonsCategory.setScenario(savedScenario);
      }
      List<Team> lessonsCategoryTeams = resolveJsonIds(nodeLessonCategory, "lessons_category_teams")
          .stream().map(teamId -> (Team) baseIds.get(teamId))
          .filter(Objects::nonNull)
          .toList();
      lessonsCategory.setTeams(lessonsCategoryTeams);
      LessonsCategory savedLessonsCategory = lessonsCategoryRepository.save(lessonsCategory);
      baseIds.put(id, savedLessonsCategory);
    });
    Stream<JsonNode> lessonsQuestions = resolveJsonElements(importNode, prefix + "lessons_questions");
    lessonsQuestions.forEach(nodeLessonQuestion -> {
      String id = nodeLessonQuestion.get("lessonsquestion_id").textValue();
      String categoryId = nodeLessonQuestion.get("lessons_question_category").asText();
      LessonsCategory lessonsCategory = (LessonsCategory) baseIds.get(categoryId);
      LessonsQuestion lessonsQuestion = new LessonsQuestion();
      lessonsQuestion.setContent(nodeLessonQuestion.get("lessons_question_content").asText());
      lessonsQuestion.setExplanation(nodeLessonQuestion.get("lessons_question_explanation").asText());
      lessonsQuestion.setOrder(nodeLessonQuestion.get("lessons_question_order").intValue());
      lessonsQuestion.setCategory(lessonsCategory);
      LessonsQuestion savedLessonsQuestion = lessonsQuestionRepository.save(lessonsQuestion);
      baseIds.put(id, savedLessonsQuestion);
    });

    // ------------ Handling injects
    Stream<JsonNode> injectsStream = resolveJsonElements(importNode, prefix + "injects");
    Stream<JsonNode> injectsNoParent = injectsStream.filter(jsonNode -> jsonNode.get("inject_depends_on").isNull());
    if (savedExercise != null) {
      importInjects(baseIds, savedExercise.getId(), null, injectsNoParent.toList());
    } else if (savedScenario != null) {
      importInjects(baseIds, null, savedScenario.getId(), injectsNoParent.toList());
    }

    // ------------ Handling variables
    Optional<Iterator<JsonNode>> variableNodesOpt = Optional.empty();
    if (ofNullable(importNode.get(EXERCISE_VARIABLES)).isPresent()) {
      variableNodesOpt = ofNullable(importNode.get(EXERCISE_VARIABLES)).map(JsonNode::elements);
    } else if (ofNullable(importNode.get(SCENARIO_VARIABLES)).isPresent()) {
      variableNodesOpt = ofNullable(importNode.get(SCENARIO_VARIABLES)).map(JsonNode::elements);
    }
    variableNodesOpt.ifPresent(variableNodes -> variableNodes.forEachRemaining(variableNode -> {
      String id = VariableWithValueMixin.getId(variableNode);
      Variable variable = VariableWithValueMixin.build(variableNode);
      if (savedExercise != null) {
        variable.setExercise(savedExercise);
      } else if (savedScenario != null) {
        variable.setScenario(savedScenario);
      }
      Variable variableSaved = this.variableRepository.save(variable);
      baseIds.put(id, variableSaved);
    }));
  }

  private Map<String, Team> handlingTeams(
      Stream<JsonNode> teamsStream,
      Map<String, Base> baseIds) {
    Map<String, Team> baseTeams = new HashMap<>();
    teamsStream.forEach(nodeTeam -> {
      String teamId = nodeTeam.get("team_id").textValue();
      String teamName = nodeTeam.get("team_name").textValue();
      // Prevent duplication of team, based on the team name and not contextual
      List<Team> existingTeams = teamRepository.findByNameIgnoreCase(teamName)
          .stream()
          .filter(t -> !t.getContextual())
          .toList();
      if (existingTeams.size() == 1) {
        Team existingTeam = existingTeams.get(0);
        baseTeams.put(teamId, existingTeam);
      } else {
        Team team = new Team();
        team.setName(nodeTeam.get("team_name").textValue());
        team.setDescription(nodeTeam.get("team_description").textValue());
        // Tags
        List<String> teamTagIds = resolveJsonIds(nodeTeam, "team_tags");
        List<Tag> tagsForTeam = teamTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
        team.setTags(tagsForTeam);
        // Users
        List<String> teamUserIds = resolveJsonIds(nodeTeam, "team_users");
        List<User> usersForTeam = teamUserIds.stream()
            .map(baseIds::get)
            .filter(Objects::nonNull)
            .map(base -> (User) base)
            .toList();
        team.setUsers(usersForTeam);
        Team savedTeam = teamRepository.save(team);
        baseTeams.put(teamId, savedTeam);
      }
    });
    return baseTeams;
  }

  private static class BaseHolder implements Base {
    private String id;

    public BaseHolder(String id) {
      this.id = id;
    }

    @Override
    public String getId() {
      return id;
    }

    @Override
    public void setId(String id) {
      this.id = id;
    }
  }
}
