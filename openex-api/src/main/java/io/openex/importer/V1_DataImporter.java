package io.openex.importer;

import com.fasterxml.jackson.databind.JsonNode;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.injects.email.EmailContract;
import io.openex.injects.manual.ManualContract;
import io.openex.injects.mastodon.MastodonContract;
import io.openex.injects.ovh_sms.OvhSmsContract;
import io.openex.service.DocumentService;
import io.openex.service.ImportEntry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.activation.MimetypesFileTypeMap;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.rest.helper.RestBehavior.fromIterable;

@Component
public class V1_DataImporter implements Importer {

    private record BaseHolder(String id) implements Base {
        @Override
        public String getId() {
            return id;
        }
    }

    private DocumentService documentService;
    private DocumentRepository documentRepository;
    private TagRepository tagRepository;
    private ExerciseRepository exerciseRepository;
    private AudienceRepository audienceRepository;
    private ObjectiveRepository objectiveRepository;
    private PollRepository pollRepository;
    private InjectRepository injectRepository;
    private OrganizationRepository organizationRepository;
    private UserRepository userRepository;
    private InjectDocumentRepository injectDocumentRepository;

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
    public void setDocumentService(DocumentService documentService) {
        this.documentService = documentService;
    }

    @Autowired
    public void setPollRepository(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
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
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
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
            } else if (type.equals(EmailContract.TYPE)) {
                contract = EmailContract.EMAIL_DEFAULT;
            } else if (type.equals(MastodonContract.TYPE)) {
                contract = MastodonContract.MASTODON_DEFAULT;
            } else if (type.equals(OvhSmsContract.TYPE)) {
                contract = OvhSmsContract.OVH_DEFAULT;
            } else if (type.equals(ManualContract.TYPE)) {
                contract = ManualContract.MANUAL_DEFAULT;
            }
            // If contract is not know, inject can't be imported
            if (contract != null) {
                String content = injectNode.get("inject_content").toString();
                JsonNode dependsOnNode = injectNode.get("inject_depends_on");
                String dependsOn = !dependsOnNode.isNull() ? baseIds.get(dependsOnNode.asText()).getId() : null;
                Long dependsDuration = injectNode.get("inject_depends_duration").asLong();
                boolean allAudiences = injectNode.get("inject_all_audiences").booleanValue();
                injectRepository.importSave(injectId, title, description, country, city, type, contract, allAudiences,
                        true, exercise.getId(), dependsOn, dependsDuration, content);
                baseIds.put(id, new BaseHolder(injectId));
                // Tags
                List<String> injectTagIds = resolveJsonIds(injectNode, "inject_tags");
                injectTagIds.forEach(tagId -> {
                    String remappedId = baseIds.get(tagId).getId();
                    injectRepository.addTag(injectId, remappedId);
                });
                // Audiences
                List<String> injectAudienceIds = resolveJsonIds(injectNode, "inject_audiences");
                injectAudienceIds.forEach(audienceId -> {
                    String remappedId = baseIds.get(audienceId).getId();
                    injectRepository.addAudience(injectId, remappedId);
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
        if (childInjects.size() > 0) {
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

        // ------------ Handling audiences
        Iterator<JsonNode> exerciseAudiences = importNode.get("exercise_audiences").elements();
        exerciseAudiences.forEachRemaining(nodeAudience -> {
            String id = nodeAudience.get("audience_id").textValue();
            Audience audience = new Audience();
            audience.setName(nodeAudience.get("audience_name").textValue());
            audience.setDescription(nodeAudience.get("audience_description").textValue());
            // Tags
            List<String> audienceTagIds = resolveJsonIds(nodeAudience, "audience_tags");
            List<Tag> tagsForAudience = audienceTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
            audience.setTags(tagsForAudience);
            // Users
            List<String> audienceUserIds = resolveJsonIds(nodeAudience, "audience_users");
            List<User> usersForAudience = audienceUserIds.stream().map(baseIds::get).map(base -> (User) base).toList();
            audience.setUsers(usersForAudience);
            // Finalize
            audience.setExercise(savedExercise);
            Audience savedAudience = audienceRepository.save(audience);
            baseIds.put(id, savedAudience);
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

        // ------------ Handling polls
        Iterator<JsonNode> exercisePolls = importNode.get("exercise_polls").elements();
        exercisePolls.forEachRemaining(nodePoll -> {
            String id = nodePoll.get("poll_id").textValue();
            Poll poll = new Poll();
            poll.setQuestion(nodePoll.get("poll_question").textValue());
            poll.setExercise(exercise);
            Poll savedPoll = pollRepository.save(poll);
            baseIds.put(id, savedPoll);
        });

        // ------------ Handling injects
        Stream<JsonNode> injectsStream = resolveJsonElements(importNode, "exercise_injects");
        Stream<JsonNode> injectsNoParent = injectsStream.filter(jsonNode -> jsonNode.get("inject_depends_on").isNull());
        importInjects(baseIds, exercise, injectsNoParent.toList());
    }
}
