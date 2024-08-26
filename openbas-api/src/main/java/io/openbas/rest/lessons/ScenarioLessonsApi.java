package io.openbas.rest.lessons;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.LessonsAnswerSpecification;
import io.openbas.database.specification.LessonsCategorySpecification;
import io.openbas.database.specification.LessonsQuestionSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.lessons.form.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static io.openbas.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
@AllArgsConstructor
public class ScenarioLessonsApi extends RestBehavior {

    public static final String SCENARIO_URI = "/api/scenarios/";

    private ScenarioRepository scenarioRepository;
    private TeamRepository teamRepository;
    private LessonsTemplateRepository lessonsTemplateRepository;
    private LessonsCategoryRepository lessonsCategoryRepository;
    private LessonsQuestionRepository lessonsQuestionRepository;
    private LessonsAnswerRepository lessonsAnswerRepository;
    private UserRepository userRepository;


    @GetMapping(SCENARIO_URI + "{scenarioId}/lessons_categories")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Iterable<LessonsCategory> scenarioLessonsCategories(@PathVariable String scenarioId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId));
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/lessons_apply_template/{lessonsTemplateId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<LessonsCategory> applyScenarioLessonsTemplate(@PathVariable String scenarioId,
                                                                  @PathVariable String lessonsTemplateId) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
        LessonsTemplate lessonsTemplate = lessonsTemplateRepository.findById(lessonsTemplateId).orElseThrow(ElementNotFoundException::new);
        List<LessonsTemplateCategory> lessonsTemplateCategories = lessonsTemplate.getCategories().stream().toList();
        for (LessonsTemplateCategory lessonsTemplateCategory : lessonsTemplateCategories) {
            LessonsCategory lessonsCategory = new LessonsCategory();
            lessonsCategory.setScenario(scenario);
            lessonsCategory.setName(lessonsTemplateCategory.getName());
            lessonsCategory.setDescription(lessonsTemplateCategory.getDescription());
            lessonsCategory.setOrder(lessonsTemplateCategory.getOrder());
            lessonsCategoryRepository.save(lessonsCategory);
            List<LessonsQuestion> lessonsQuestions = lessonsTemplateCategory.getQuestions().stream()
                    .map(lessonsTemplateQuestion -> {
                        LessonsQuestion lessonsQuestion = new LessonsQuestion();
                        lessonsQuestion.setCategory(lessonsCategory);
                        lessonsQuestion.setContent(lessonsTemplateQuestion.getContent());
                        lessonsQuestion.setExplanation(lessonsTemplateQuestion.getExplanation());
                        lessonsQuestion.setOrder(lessonsTemplateQuestion.getOrder());
                        return lessonsQuestion;
                    }).toList();
            lessonsQuestionRepository.saveAll(lessonsQuestions);
        }
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId));
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/lessons_categories")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public LessonsCategory createScenarioLessonsCategory(@PathVariable String scenarioId,
                                                         @Valid @RequestBody LessonsCategoryCreateInput input) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
        LessonsCategory lessonsCategory = new LessonsCategory();
        lessonsCategory.setUpdateAttributes(input);
        lessonsCategory.setScenario(scenario);
        return lessonsCategoryRepository.save(lessonsCategory);
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/lessons_answers_reset")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<LessonsCategory> resetScenarioLessonsAnswers(@PathVariable String scenarioId) {
        List<LessonsAnswer> lessonsAnswers = lessonsCategoryRepository.findAll(
                        LessonsCategorySpecification.fromScenario(scenarioId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                                LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
                        .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                                LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
                .toList();
        lessonsAnswerRepository.deleteAll(lessonsAnswers);
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId)).stream().toList();
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/lessons_empty")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<LessonsCategory> emptyScenarioLessons(@PathVariable String scenarioId) {
        List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(
                LessonsCategorySpecification.fromScenario(scenarioId)).stream().toList();
        lessonsCategoryRepository.deleteAll(lessonsCategories);
        lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId))
                .stream().toList();
        return lessonsCategories;
    }

    @PutMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public LessonsCategory updateScenarioLessonsCategory(@PathVariable String scenarioId,
                                                         @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryUpdateInput input) {
        LessonsCategory lessonsTemplateCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow(ElementNotFoundException::new);
        lessonsTemplateCategory.setUpdateAttributes(input);
        lessonsTemplateCategory.setUpdated(now());
        return lessonsCategoryRepository.save(lessonsTemplateCategory);
    }

    @DeleteMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteScenarioLessonsCategory(@PathVariable String scenarioId, @PathVariable String lessonsCategoryId) {
        lessonsCategoryRepository.deleteById(lessonsCategoryId);
    }

    @PutMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}/teams")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public LessonsCategory updateScenarioLessonsCategoryTeams(@PathVariable String scenarioId,
                                                              @PathVariable String lessonsCategoryId,
                                                              @Valid @RequestBody LessonsCategoryTeamsInput input) {
        LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow(ElementNotFoundException::new);
        Iterable<Team> lessonsCategoryTeams = teamRepository.findAllById(input.getTeamIds());
        lessonsCategory.setTeams(fromIterable(lessonsCategoryTeams));
        return lessonsCategoryRepository.save(lessonsCategory);
    }

    @GetMapping(SCENARIO_URI + "{scenarioId}/lessons_questions")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Iterable<LessonsQuestion> scenarioLessonsQuestions(@PathVariable String scenarioId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                        LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()).toList();
    }

    @GetMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Iterable<LessonsQuestion> scenarioLessonsCategoryQuestions(@PathVariable String scenarioId,
                                                                      @PathVariable String lessonsCategoryId) {
        return lessonsQuestionRepository.findAll(LessonsQuestionSpecification.fromCategory(lessonsCategoryId));
    }

    @PostMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public LessonsQuestion createScenarioLessonsQuestion(@PathVariable String scenarioId,
                                                         @PathVariable String lessonsCategoryId,
                                                         @Valid @RequestBody LessonsQuestionCreateInput input) {
        LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow(ElementNotFoundException::new);
        LessonsQuestion lessonsQuestion = new LessonsQuestion();
        lessonsQuestion.setUpdateAttributes(input);
        lessonsQuestion.setCategory(lessonsCategory);
        return lessonsQuestionRepository.save(lessonsQuestion);
    }

    @PutMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public LessonsQuestion updateScenarioLessonsQuestion(@PathVariable String scenarioId,
                                                         @PathVariable String lessonsQuestionId,
                                                         @Valid @RequestBody LessonsQuestionUpdateInput input) {
        LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId).orElseThrow(ElementNotFoundException::new);
        lessonsQuestion.setUpdateAttributes(input);
        lessonsQuestion.setUpdated(now());
        return lessonsQuestionRepository.save(lessonsQuestion);
    }

    @DeleteMapping(SCENARIO_URI + "{scenarioId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteScenarioLessonsQuestion(@PathVariable String scenarioId, @PathVariable String lessonsQuestionId) {
        lessonsQuestionRepository.deleteById(lessonsQuestionId);
    }

    @GetMapping(SCENARIO_URI + "{scenarioId}/lessons_answers")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public List<LessonsAnswer> scenarioLessonsAnswers(@PathVariable String scenarioId,
                                                      @RequestParam Optional<String> userId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                                LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
                        .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                                LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
                .toList();
    }

    @GetMapping("/api/player/lessons/scenario/{scenarioId}/lessons_answers")
    public List<LessonsAnswer> playerLessonsAnswers(@PathVariable String scenarioId,
                                                    @RequestParam Optional<String> userId) {
        impersonateUser(userRepository, userId); // Protection for ?
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromScenario(scenarioId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                                LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
                        .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                                LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
                .toList();
    }

    @PostMapping("/api/player/lessons/scenario/{scenarioId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}/lessons_answers")
    public LessonsAnswer createScenarioLessonsQuestion(@PathVariable String scenarioId,
                                                       @PathVariable String lessonsQuestionId,
                                                       @Valid @RequestBody LessonsAnswerCreateInput input,
                                                       @RequestParam Optional<String> userId) {
        User user = impersonateUser(userRepository, userId);
        LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId).orElseThrow(ElementNotFoundException::new);
        LessonsAnswer lessonsAnswer = new LessonsAnswer();
        lessonsAnswer.setQuestion(lessonsQuestion);
        lessonsAnswer.setScore(input.getScore());
        lessonsAnswer.setPositive(input.getPositive());
        lessonsAnswer.setNegative(input.getNegative());
        lessonsAnswer.setUser(user);
        return lessonsAnswerRepository.save(lessonsAnswer);
    }
}