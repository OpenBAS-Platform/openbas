package io.openbas.rest.lessons;

import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.LessonsAnswerSpecification;
import io.openbas.database.specification.LessonsCategorySpecification;
import io.openbas.database.specification.LessonsQuestionSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.lessons.form.*;
import io.openbas.service.MailingService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static io.openbas.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
@RequiredArgsConstructor
public class ExerciseLessonsApi extends RestBehavior {

    public static final String EXERCISE_URL = "/api/exercises/";

    private final ExerciseRepository exerciseRepository;
    private final TeamRepository teamRepository;
    private final LessonsTemplateRepository lessonsTemplateRepository;
    private final LessonsCategoryRepository lessonsCategoryRepository;
    private final LessonsQuestionRepository lessonsQuestionRepository;
    private final LessonsAnswerRepository lessonsAnswerRepository;
    private final UserRepository userRepository;
    private final MailingService mailingService;


    @GetMapping(EXERCISE_URL + "{exerciseId}/lessons_categories")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<LessonsCategory> exerciseLessonsCategories(@PathVariable String exerciseId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId));
    }

    @PostMapping(EXERCISE_URL + "{exerciseId}/lessons_apply_template/{lessonsTemplateId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<LessonsCategory> applyExerciseLessonsTemplate(@PathVariable String exerciseId,
                                                                  @PathVariable String lessonsTemplateId) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        LessonsTemplate lessonsTemplate = lessonsTemplateRepository.findById(lessonsTemplateId)
                .orElseThrow(ElementNotFoundException::new);
        List<LessonsTemplateCategory> lessonsTemplateCategories = lessonsTemplate.getCategories().stream().toList();
        for (LessonsTemplateCategory lessonsTemplateCategory : lessonsTemplateCategories) {
            LessonsCategory lessonsCategory = new LessonsCategory();
            lessonsCategory.setExercise(exercise);
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
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId));
    }

    @PostMapping(EXERCISE_URL + "{exerciseId}/lessons_categories")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public LessonsCategory createExerciseLessonsCategory(@PathVariable String exerciseId,
                                                         @Valid @RequestBody LessonsCategoryCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        LessonsCategory lessonsCategory = new LessonsCategory();
        lessonsCategory.setUpdateAttributes(input);
        lessonsCategory.setExercise(exercise);
        return lessonsCategoryRepository.save(lessonsCategory);
    }

    @PostMapping(EXERCISE_URL + "{exerciseId}/lessons_answers_reset")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<LessonsCategory> resetExerciseLessonsAnswers(@PathVariable String exerciseId) {
        List<LessonsAnswer> lessonsAnswers = lessonsCategoryRepository.findAll(
                        LessonsCategorySpecification.fromExercise(exerciseId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                                LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
                        .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                                LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
                .toList();
        lessonsAnswerRepository.deleteAll(lessonsAnswers);
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
    }

    @PostMapping(EXERCISE_URL + "{exerciseId}/lessons_empty")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public Iterable<LessonsCategory> emptyExerciseLessons(@PathVariable String exerciseId) {
        List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(
                LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        lessonsCategoryRepository.deleteAll(lessonsCategories);
        lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId))
                .stream().toList();
        return lessonsCategories;
    }

    @PutMapping(EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public LessonsCategory updateExerciseLessonsCategory(@PathVariable String exerciseId,
                                                         @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryUpdateInput input) {
        LessonsCategory lessonsTemplateCategory = lessonsCategoryRepository.findById(lessonsCategoryId)
                .orElseThrow(ElementNotFoundException::new);
        lessonsTemplateCategory.setUpdateAttributes(input);
        lessonsTemplateCategory.setUpdated(now());
        return lessonsCategoryRepository.save(lessonsTemplateCategory);
    }

    @DeleteMapping(EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteExerciseLessonsCategory(@PathVariable String exerciseId, @PathVariable String lessonsCategoryId) {
        lessonsCategoryRepository.deleteById(lessonsCategoryId);
    }

    @PutMapping(EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}/teams")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public LessonsCategory updateExerciseLessonsCategoryTeams(@PathVariable String exerciseId,
                                                              @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryTeamsInput input) {
        LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId)
                .orElseThrow(ElementNotFoundException::new);
        Iterable<Team> lessonsCategoryTeams = teamRepository.findAllById(input.getTeamIds());
        lessonsCategory.setTeams(fromIterable(lessonsCategoryTeams));
        return lessonsCategoryRepository.save(lessonsCategory);
    }

    @GetMapping(EXERCISE_URL + "{exerciseId}/lessons_questions")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<LessonsQuestion> exerciseLessonsQuestions(@PathVariable String exerciseId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                        LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()).toList();
    }

    @GetMapping(EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<LessonsQuestion> exerciseLessonsCategoryQuestions(@PathVariable String exerciseId,
                                                                      @PathVariable String lessonsCategoryId) {
        return lessonsQuestionRepository.findAll(LessonsQuestionSpecification.fromCategory(lessonsCategoryId));
    }

    @PostMapping(EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public LessonsQuestion createExerciseLessonsQuestion(@PathVariable String exerciseId,
                                                         @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsQuestionCreateInput input) {
        LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId)
                .orElseThrow(ElementNotFoundException::new);
        LessonsQuestion lessonsQuestion = new LessonsQuestion();
        lessonsQuestion.setUpdateAttributes(input);
        lessonsQuestion.setCategory(lessonsCategory);
        return lessonsQuestionRepository.save(lessonsQuestion);
    }

    @PutMapping(
            EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public LessonsQuestion updateExerciseLessonsQuestion(@PathVariable String exerciseId,
                                                         @PathVariable String lessonsQuestionId, @Valid @RequestBody LessonsQuestionUpdateInput input) {
        LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId)
                .orElseThrow(ElementNotFoundException::new);
        lessonsQuestion.setUpdateAttributes(input);
        lessonsQuestion.setUpdated(now());
        return lessonsQuestionRepository.save(lessonsQuestion);
    }

    @DeleteMapping(
            EXERCISE_URL + "{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public void deleteExerciseLessonsQuestion(@PathVariable String exerciseId, @PathVariable String lessonsQuestionId) {
        lessonsQuestionRepository.deleteById(lessonsQuestionId);
    }

    @PostMapping(EXERCISE_URL + "{exerciseId}/lessons_send")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    @Transactional(rollbackOn = Exception.class)
    public void sendExerciseLessons(@PathVariable String exerciseId, @Valid @RequestBody LessonsSendInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(
                LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        List<User> users = lessonsCategories.stream().flatMap(lessonsCategory -> lessonsCategory.getTeams().stream()
                .flatMap(team -> team.getUsers().stream())).distinct().toList();
        mailingService.sendEmail(input.getSubject(), input.getBody(), users, Optional.of(exercise));
    }

    @GetMapping(EXERCISE_URL + "{exerciseId}/lessons_answers")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public List<LessonsAnswer> exerciseLessonsAnswers(@PathVariable String exerciseId,
                                                      @RequestParam Optional<String> userId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                                LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
                        .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                                LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
                .toList();
    }

    @GetMapping("/api/player/lessons/exercise/{exerciseId}/lessons_categories")
    public List<LessonsCategory> playerLessonsCategories(@PathVariable String exerciseId,
                                                         @RequestParam Optional<String> userId) {
        impersonateUser(userRepository, userId); // Protection for ?
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId));
    }

    @GetMapping("/api/player/lessons/exercise/{exerciseId}/lessons_questions")
    public List<LessonsQuestion> playerLessonsQuestions(@PathVariable String exerciseId,
                                                        @RequestParam Optional<String> userId) {
        impersonateUser(userRepository, userId); // Protection for ?
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                        LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()).toList();
    }

    @GetMapping("/api/player/lessons/exercise/{exerciseId}/lessons_answers")
    public List<LessonsAnswer> playerLessonsAnswers(@PathVariable String exerciseId,
                                                    @RequestParam Optional<String> userId) {
        impersonateUser(userRepository, userId); // Protection for ?
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream()
                .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
                                LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()
                        .flatMap(lessonsQuestion -> lessonsAnswerRepository.findAll(
                                LessonsAnswerSpecification.fromQuestion(lessonsQuestion.getId())).stream()))
                .toList();
    }

    @PostMapping("/api/player/lessons/exercise/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}/lessons_answers")
    public LessonsAnswer createExerciseLessonsQuestion(@PathVariable String exerciseId,
                                                       @PathVariable String lessonsQuestionId, @Valid @RequestBody LessonsAnswerCreateInput input,
                                                       @RequestParam Optional<String> userId) {
        User user = impersonateUser(userRepository, userId);
        LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId)
                .orElseThrow(ElementNotFoundException::new);

        Optional<LessonsAnswer> optionalAnswer = lessonsAnswerRepository.findByUserIdAndQuestionId(user.getId(),
                lessonsQuestionId);
        LessonsAnswer lessonsAnswer = optionalAnswer.orElseGet(() -> {
            LessonsAnswer newAnswer = new LessonsAnswer();
            newAnswer.setQuestion(lessonsQuestion);
            newAnswer.setUser(user);
            return newAnswer;
        });
        lessonsAnswer.setScore(input.getScore());
        lessonsAnswer.setPositive(input.getPositive());
        lessonsAnswer.setNegative(input.getNegative());

        return lessonsAnswerRepository.save(lessonsAnswer);
    }
}
