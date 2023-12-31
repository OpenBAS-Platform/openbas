package io.openex.rest.lessons;

import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.LessonsAnswerSpecification;
import io.openex.database.specification.LessonsCategorySpecification;
import io.openex.database.specification.LessonsQuestionSpecification;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.lessons.form.*;
import io.openex.service.MailingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

import static io.openex.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
public class LessonsApi extends RestBehavior {

  private ExerciseRepository exerciseRepository;
  private TeamRepository teamRepository;
  private LessonsTemplateRepository lessonsTemplateRepository;
  private LessonsCategoryRepository lessonsCategoryRepository;
  private LessonsQuestionRepository lessonsQuestionRepository;
  private LessonsAnswerRepository lessonsAnswerRepository;
  private UserRepository userRepository;
  private MailingService mailingService;

  @Autowired
  public void setMailingService(MailingService mailingService) {
    this.mailingService = mailingService;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
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
  public void setLessonsTemplateRepository(LessonsTemplateRepository lessonsTemplateRepository) {
    this.lessonsTemplateRepository = lessonsTemplateRepository;
  }

  @Autowired
  public void setLessonsCategoryRepository(LessonsCategoryRepository lessonsCategoryRepository) {
    this.lessonsCategoryRepository = lessonsCategoryRepository;
  }

  @Autowired
  public void setLessonsQuestionRepository(LessonsQuestionRepository lessonsQuestionRepository) {
    this.lessonsQuestionRepository = lessonsQuestionRepository;
  }

  @Autowired
  public void setLessonsAnswerRepository(LessonsAnswerRepository lessonsAnswerRepository) {
    this.lessonsAnswerRepository = lessonsAnswerRepository;
  }

  @GetMapping("/api/exercises/{exerciseId}/lessons_categories")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<LessonsCategory> exerciseLessonsCategories(@PathVariable String exerciseId) {
    return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId));
  }

  @PostMapping("/api/exercises/{exerciseId}/lessons_apply_template/{lessonsTemplateId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Iterable<LessonsCategory> applyExerciseLessonsTemplate(@PathVariable String exerciseId,
      @PathVariable String lessonsTemplateId) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    LessonsTemplate lessonsTemplate = lessonsTemplateRepository.findById(lessonsTemplateId).orElseThrow();
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

  @PostMapping("/api/exercises/{exerciseId}/lessons_categories")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public LessonsCategory createExerciseLessonsCategory(@PathVariable String exerciseId,
      @Valid @RequestBody LessonsCategoryCreateInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    LessonsCategory lessonsCategory = new LessonsCategory();
    lessonsCategory.setUpdateAttributes(input);
    lessonsCategory.setExercise(exercise);
    return lessonsCategoryRepository.save(lessonsCategory);
  }

  @PostMapping("/api/exercises/{exerciseId}/lessons_answers_reset")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
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

  @PostMapping("/api/exercises/{exerciseId}/lessons_empty")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Iterable<LessonsCategory> emptyExerciseLessons(@PathVariable String exerciseId) {
    List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(
        LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
    lessonsCategoryRepository.deleteAll(lessonsCategories);
    lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId))
        .stream().toList();
    return lessonsCategories;
  }

  @PutMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public LessonsCategory updateExerciseLessonsCategory(@PathVariable String exerciseId,
      @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryUpdateInput input) {
    LessonsCategory lessonsTemplateCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow();
    lessonsTemplateCategory.setUpdateAttributes(input);
    lessonsTemplateCategory.setUpdated(now());
    return lessonsCategoryRepository.save(lessonsTemplateCategory);
  }

  @DeleteMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteExerciseLessonsCategory(@PathVariable String exerciseId, @PathVariable String lessonsCategoryId) {
    lessonsCategoryRepository.deleteById(lessonsCategoryId);
  }

  @PutMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/audiences")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public LessonsCategory updateExerciseLessonsCategoryTeams(@PathVariable String exerciseId,
      @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryTeamsInput input) {
    LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow();
    Iterable<Team> lessonsCategoryTeams = teamRepository.findAllById(input.getTeamIds());
    lessonsCategory.setTeams(fromIterable(lessonsCategoryTeams));
    return lessonsCategoryRepository.save(lessonsCategory);
  }

  @GetMapping("/api/exercises/{exerciseId}/lessons_questions")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<LessonsQuestion> exerciseLessonsQuestions(@PathVariable String exerciseId) {
    return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream()
        .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
            LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()).toList();
  }

  @GetMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<LessonsQuestion> exerciseLessonsCategoryQuestions(@PathVariable String exerciseId,
      @PathVariable String lessonsCategoryId) {
    return lessonsQuestionRepository.findAll(LessonsQuestionSpecification.fromCategory(lessonsCategoryId));
  }

  @PostMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public LessonsQuestion createExerciseLessonsQuestion(@PathVariable String exerciseId,
      @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsQuestionCreateInput input) {
    LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow();
    LessonsQuestion lessonsQuestion = new LessonsQuestion();
    lessonsQuestion.setUpdateAttributes(input);
    lessonsQuestion.setCategory(lessonsCategory);
    return lessonsQuestionRepository.save(lessonsQuestion);
  }

  @PutMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public LessonsQuestion updateExerciseLessonsQuestion(@PathVariable String exerciseId,
      @PathVariable String lessonsQuestionId, @Valid @RequestBody LessonsQuestionUpdateInput input) {
    LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId).orElseThrow();
    lessonsQuestion.setUpdateAttributes(input);
    lessonsQuestion.setUpdated(now());
    return lessonsQuestionRepository.save(lessonsQuestion);
  }

  @DeleteMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteExerciseLessonsQuestion(@PathVariable String exerciseId, @PathVariable String lessonsQuestionId) {
    lessonsQuestionRepository.deleteById(lessonsQuestionId);
  }

  @PostMapping("/api/exercises/{exerciseId}/lessons_send")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void sendExerciseLessons(@PathVariable String exerciseId, @Valid @RequestBody LessonsSendInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(
        LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
    List<User> users = lessonsCategories.stream().flatMap(lessonsCategory -> lessonsCategory.getTeams().stream()
        .flatMap(team -> team.getUsers().stream())).distinct().toList();
    mailingService.sendEmail(input.getSubject(), input.getBody(), users, Optional.of(exercise));
  }

  @GetMapping("/api/exercises/{exerciseId}/lessons_answers")
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

  @GetMapping("/api/player/lessons/{exerciseId}/lessons_categories")
  public List<LessonsCategory> playerLessonsCategories(@PathVariable String exerciseId,
      @RequestParam Optional<String> userId) {
    impersonateUser(userRepository, userId); // Protection for ?
    return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId));
  }

  @GetMapping("/api/player/lessons/{exerciseId}/lessons_questions")
  public List<LessonsQuestion> playerLessonsQuestions(@PathVariable String exerciseId,
      @RequestParam Optional<String> userId) {
    impersonateUser(userRepository, userId); // Protection for ?
    return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream()
        .flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(
            LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()).toList();
  }

  @GetMapping("/api/player/lessons/{exerciseId}/lessons_answers")
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

  @PostMapping("/api/player/lessons/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}/lessons_answers")
  public LessonsAnswer createExerciseLessonsQuestion(@PathVariable String exerciseId,
      @PathVariable String lessonsQuestionId, @Valid @RequestBody LessonsAnswerCreateInput input,
      @RequestParam Optional<String> userId) {
    User user = impersonateUser(userRepository, userId);
    LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId).orElseThrow();
    LessonsAnswer lessonsAnswer = new LessonsAnswer();
    lessonsAnswer.setQuestion(lessonsQuestion);
    lessonsAnswer.setScore(input.getScore());
    lessonsAnswer.setPositive(input.getPositive());
    lessonsAnswer.setNegative(input.getNegative());
    lessonsAnswer.setUser(user);
    return lessonsAnswerRepository.save(lessonsAnswer);
  }
}
