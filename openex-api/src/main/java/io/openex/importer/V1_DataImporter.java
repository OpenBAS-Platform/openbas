package io.openex.importer;

import com.fasterxml.jackson.databind.JsonNode;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.rest.helper.RestBehavior.fromIterable;

@Component
public class V1_DataImporter implements Importer {

    private static class BaseHolder implements Base {

        private String id;

        public BaseHolder(String id) {
            this.id = id;
        }

        @Override
        public String getId() {
            return id;
        }
    }

    private TagRepository tagRepository;
    private ExerciseRepository exerciseRepository;
    private AudienceRepository audienceRepository;
    private ObjectiveRepository objectiveRepository;
    private PollRepository pollRepository;
    private InjectRepository<?> injectRepository;

    @Autowired
    public void setPollRepository(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    @Autowired
    public void setObjectiveRepository(ObjectiveRepository objectiveRepository) {
        this.objectiveRepository = objectiveRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository<?> injectRepository) {
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
            String content = injectNode.get("inject_content").toString();
            JsonNode dependsOnNode = injectNode.get("inject_depends_on");
            String dependsOn = !dependsOnNode.isNull() ? baseIds.get(dependsOnNode.asText()).getId() : null;
            Long dependsDuration = injectNode.get("inject_depends_duration").asLong();
            boolean allAudiences = injectNode.get("inject_all_audiences").booleanValue();
            injectRepository.importSave(injectId, title, description, country, city, type, allAudiences,
                    true, exercise.getId(), dependsOn, dependsDuration, content);
            baseIds.put(id, new BaseHolder(injectId));
            List<String> injectTagIds = resolveJsonIds(injectNode, "inject_tags");
            injectTagIds.forEach(tagId -> {
                String remappedId = baseIds.get(tagId).getId();
                injectRepository.addTag(injectId, remappedId);
            });
            List<String> injectAudienceIds = resolveJsonIds(injectNode, "inject_audiences");
            injectAudienceIds.forEach(audienceId -> {
                String remappedId = baseIds.get(audienceId).getId();
                injectRepository.addAudience(injectId, remappedId);
            });
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

    @Override
    public void importData(JsonNode importNode) {
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
        // TODO Handle image of exercise
        List<String> exerciseTagIds = resolveJsonIds(exerciseNode, "exercise_tags");
        List<Tag> tagsForExercise = exerciseTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
        exercise.setTags(tagsForExercise);
        Exercise savedExercise = exerciseRepository.save(exercise);

        // ------------ Handling audiences
        Iterator<JsonNode> exerciseAudiences = importNode.get("exercise_audiences").elements();
        exerciseAudiences.forEachRemaining(nodeAudience -> {
            String id = nodeAudience.get("audience_id").textValue();
            Audience audience = new Audience();
            audience.setName(nodeAudience.get("audience_name").textValue());
            audience.setDescription(nodeAudience.get("audience_description").textValue());
            List<String> audienceTagIds = resolveJsonIds(nodeAudience, "audience_tags");
            List<Tag> tagsForAudience = audienceTagIds.stream().map(baseIds::get).map(base -> (Tag) base).toList();
            audience.setTags(tagsForAudience);
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
