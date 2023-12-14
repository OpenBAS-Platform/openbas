package io.openex.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.injects.challenge.model.ChallengeContent;
import io.openex.injects.email.EmailContract;
import io.openex.injects.manual.ManualContract;
import io.openex.injects.channel.model.ChannelContent;
import io.openex.rest.exercise.exports.ExerciseFileExport;
import io.openex.rest.exercise.exports.VariableWithValueMixin;
import io.openex.service.FileService;
import io.openex.service.ImportEntry;
import io.openex.service.VariableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.activation.MimetypesFileTypeMap;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openex.injects.channel.ChannelContract.CHANNEL_PUBLISH;
import static java.util.Optional.ofNullable;

@Component
public class V1_DataImporter implements Importer {

    // region variables
    @Resource
    protected ObjectMapper mapper;
    private FileService documentService;
    private DocumentRepository documentRepository;
    private TagRepository tagRepository;
    private ExerciseRepository exerciseRepository;
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
    private VariableService variableService;
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
    public void setTeamRepository(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setVariableService(@NotNull final VariableService variableService) {
        this.variableService = variableService;
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

    private void importInjects(Map<String, Base> baseIds, Exercise exercise, List<JsonNode> injects) {
        List<String> injected = new ArrayList<>();
        injects.forEach(injectNode -> {
            String injectId = UUID.randomUUID().toString();
            injected.add(injectId);
            String id = injectNode.get("inject_id").textValue();
            String title = injectNode.get("inject_title").textValue();
            String description = injectNode.get("inject_description").textValue();
            String country = injectNode.get("inject_country").textValue();
            String city = injectNode.get("inject_city").textValue();
            String type = injectNode.get("inject_type").textValue();
            String contract = null;
            JsonNode injectContractNode = injectNode.get("inject_contract");
            // In old v1 import, contract could be empty
            // In this case basic inject types must be mapped to corresponding default contract
            if (injectContractNode != null) {
                contract = injectContractNode.textValue();
            } else if (type.equals("openex_email")) {
                contract = EmailContract.EMAIL_DEFAULT;
            } else if (type.equals("openex_mastodon")) {
                contract = "aeab9ed6-ae98-4b48-b8cc-2e91ac54f2f9";
            } else if (type.equals("openex_ovh_sms")) {
                contract = "e9e902bc-b03d-4223-89e1-fca093ac79dd";
            } else if (type.equals("openex_manual")) {
                contract = ManualContract.MANUAL_DEFAULT;
            }
            // If contract is not know, inject can't be imported
            String content = handleInjectContent(baseIds, contract, injectNode);
            if (content != null) {
                JsonNode dependsOnNode = injectNode.get("inject_depends_on");
                String dependsOn = !dependsOnNode.isNull() ? baseIds.get(dependsOnNode.asText()).getId() : null;
                Long dependsDuration = injectNode.get("inject_depends_duration").asLong();
                boolean allTeams = injectNode.get("inject_all_teams").booleanValue();
                injectRepository.importSave(injectId, title, description, country, city, type, contract, allTeams,
                        true, exercise.getId(), dependsOn, dependsDuration, content);
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
            }
        });
        // Looking for child of created injects
        List<JsonNode> childInjects = injects.stream().filter(jsonNode -> {
            String injectDependsOn = jsonNode.get("inject_depends_on").asText();
            return injected.contains(injectDependsOn);
        }).toList();
        if (!childInjects.isEmpty()) {
            importInjects(baseIds, exercise, childInjects);
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
        // ------------ Handling tags
        Stream<JsonNode> tagsStream = resolveJsonElements(importNode, "exercise_tags");
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
        Exercise exercise = new Exercise();
        exercise.setName(exerciseNode.get("exercise_name").textValue() + " (Import)");
        exercise.setDescription(exerciseNode.get("exercise_description").textValue());
        exercise.setSubtitle(exerciseNode.get("exercise_subtitle").textValue());
        exercise.setHeader(exerciseNode.get("exercise_message_header").textValue());
        exercise.setFooter(exerciseNode.get("exercise_message_footer").textValue());
        exercise.setReplyTo(exerciseNode.get("exercise_mail_from").textValue());
        List<String> exerciseTagIds = resolveJsonIds(exerciseNode, "exercise_tags");
        List<Tag> tagsForExercise = exerciseTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
        exercise.setTags(tagsForExercise);
        Exercise savedExercise = exerciseRepository.save(exercise);

        // ------------ Handling documents
        Iterator<JsonNode> exerciseDocuments = importNode.get("exercise_documents").elements();
        exerciseDocuments.forEachRemaining(nodeDoc -> {
            String id = nodeDoc.get("document_id").textValue();
            String name = nodeDoc.get("document_name").textValue();
            String description = nodeDoc.get("document_description").textValue();
            String target = nodeDoc.get("document_target").textValue();
            List<String> documentTagIds = resolveJsonIds(nodeDoc, "document_tags");
            ImportEntry entry = docReferences.get(target);
            if (entry != null) {
                List<String> exerciseIds = List.of(savedExercise.getId());
                String contentType = new MimetypesFileTypeMap().getContentType(entry.getEntry().getName());
                Optional<Document> targetDocument = documentRepository.findByTarget(target);
                if (targetDocument.isPresent()) {
                    Document document = targetDocument.get();
                    // Compute exercises
                    List<Exercise> exercises = new ArrayList<>(document.getExercises());
                    List<Exercise> inputExercises = fromIterable(exerciseRepository.findAllById(exerciseIds));
                    inputExercises.forEach(inputExercise -> {
                        if (!exercises.contains(inputExercise)) {
                            exercises.add(inputExercise);
                        }
                    });
                    document.setExercises(exercises);
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
                    document.setExercises(fromIterable(exerciseRepository.findAllById(exerciseIds)));
                    document.setTags(fromIterable(tagRepository.findAllById(documentTagIds)));
                    document.setType(contentType);
                    Document savedDocument = documentRepository.save(document);
                    baseIds.put(id, savedDocument);
                }
            }
        });

        // ------------ Handling organizations
        if (importNode.get("exercise_organizations") != null) {
            Map<String, Organization> existingOrganizationsByName = fromIterable(organizationRepository.findAll()).stream().collect(
                    Collectors.toMap(Organization::getName, Function.identity()));
            Iterator<JsonNode> exerciseOrganizations = importNode.get("exercise_organizations").elements();
            exerciseOrganizations.forEachRemaining(nodeOrganization -> {
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
        if (importNode.get("exercise_users") != null) {
            Map<String, User> existingUsersByEmail = fromIterable(userRepository.findAll()).stream().collect(
                    Collectors.toMap(User::getEmail, Function.identity()));
            Iterator<JsonNode> exerciseUsers = importNode.get("exercise_users").elements();
            exerciseUsers.forEachRemaining(nodeUser -> {
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
        Iterator<JsonNode> exerciseTeams = importNode.get("exercise_teams").elements();
        exerciseTeams.forEachRemaining(nodeTeam -> {
            String id = nodeTeam.get("team_id").textValue();
            String teamName = nodeTeam.get("team_name").textValue();
            // Prevent duplication of team, based on the team name
            List<Team> existingTeams = teamRepository.findByNameIgnoreCase(teamName);
            if (existingTeams.size() == 1) {
                baseIds.put(id, existingTeams.get(0));
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
                List<User> usersForTeam = teamUserIds.stream().map(baseIds::get).map(base -> (User) base).toList();
                team.setUsers(usersForTeam);
                List<Exercise> savedExercises = new ArrayList<>();
                savedExercises.add(savedExercise);
                team.setExercises(savedExercises);
                Team savedTeam = teamRepository.save(team);
                baseIds.put(id, savedTeam);
            }
        });

        // ------------ Handling challenges
        Stream<JsonNode> challengesStream = resolveJsonElements(importNode, "exercise_challenges");
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
        Stream<JsonNode> channelsStream = resolveJsonElements(importNode, "exercise_channels");
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
        Stream<JsonNode> articlesStream = resolveJsonElements(importNode, "exercise_articles");
        articlesStream.forEach(nodeArticle -> {
            String id = nodeArticle.get("article_id").textValue();
            Article article = new Article();
            article.setName(nodeArticle.get("article_name").textValue());
            article.setContent(nodeArticle.get("article_content").textValue());
            article.setAuthor(nodeArticle.get("article_author").textValue());
            article.setShares(nodeArticle.get("article_shares").intValue());
            article.setLikes(nodeArticle.get("article_likes").intValue());
            article.setComments(nodeArticle.get("article_comments").intValue());
            article.setExercise(exercise);
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
        Iterator<JsonNode> exerciseObjectives = importNode.get("exercise_objectives").elements();
        exerciseObjectives.forEachRemaining(nodeObjective -> {
            String id = nodeObjective.get("objective_id").textValue();
            Objective objective = new Objective();
            objective.setTitle(nodeObjective.get("objective_title").textValue());
            objective.setDescription(nodeObjective.get("objective_description").textValue());
            objective.setPriority((short) nodeObjective.get("objective_priority").asInt(0));
            objective.setExercise(exercise);
            Objective savedObjective = objectiveRepository.save(objective);
            baseIds.put(id, savedObjective);
        });

        // ------------ Handling lessons
        Iterator<JsonNode> exerciseLessonsCategories = importNode.get("exercise_lessons_categories").elements();
        exerciseLessonsCategories.forEachRemaining(nodeLessonCategory -> {
            String id = nodeLessonCategory.get("lessonscategory_id").textValue();
            LessonsCategory lessonsCategory = new LessonsCategory();
            lessonsCategory.setName(nodeLessonCategory.get("lessons_category_name").textValue());
            lessonsCategory.setDescription(nodeLessonCategory.get("lessons_category_description").textValue());
            lessonsCategory.setOrder(nodeLessonCategory.get("lessons_category_order").intValue());
            lessonsCategory.setExercise(exercise);
            List<Team> lessonsCategoryTeams = resolveJsonIds(nodeLessonCategory, "lessons_category_teams")
                    .stream().map(teamId -> (Team) baseIds.get(teamId))
                    .filter(Objects::nonNull)
                    .toList();
            lessonsCategory.setTeams(lessonsCategoryTeams);
            LessonsCategory savedLessonsCategory = lessonsCategoryRepository.save(lessonsCategory);
            baseIds.put(id, savedLessonsCategory);
        });
        Stream<JsonNode> exerciseLessonsQuestions = resolveJsonElements(importNode, "exercise_lessons_questions");
        exerciseLessonsQuestions.forEach(nodeLessonQuestion -> {
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
        Stream<JsonNode> injectsStream = resolveJsonElements(importNode, "exercise_injects");
        Stream<JsonNode> injectsNoParent = injectsStream.filter(jsonNode -> jsonNode.get("inject_depends_on").isNull());
        importInjects(baseIds, exercise, injectsNoParent.toList());

        // ------------ Handling variables
        Optional<Iterator<JsonNode>> variableNodesOpt = ofNullable(importNode.get(ExerciseFileExport.EXERCISE_VARIABLES)).map(JsonNode::elements);
        variableNodesOpt.ifPresent(variableNodes -> variableNodes.forEachRemaining(variableNode -> {
                String id = VariableWithValueMixin.getId(variableNode);
                Variable variable = VariableWithValueMixin.build(variableNode);
                Variable variableSaved = this.variableService.createVariable(savedExercise.getId(), variable);
                baseIds.put(id, variableSaved);
            }));
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
