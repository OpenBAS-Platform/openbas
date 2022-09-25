package io.openex.rest.lessons;

import io.openex.config.OpenExConfig;
import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.*;
import io.openex.database.specification.LessonsCategorySpecification;
import io.openex.database.specification.LessonsQuestionSpecification;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Injector;
import io.openex.injects.email.EmailContract;
import io.openex.injects.email.model.EmailContent;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.lessons.form.*;
import io.openex.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.List;

import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.helper.UserHelper.currentUser;
import static java.time.Instant.now;

@RestController
public class LessonsApi extends RestBehavior {

    @Resource
    private OpenExConfig openExConfig;

    private ExerciseRepository exerciseRepository;
    private AudienceRepository audienceRepository;
    private LessonsTemplateRepository lessonsTemplateRepository;
    private LessonsCategoryRepository lessonsCategoryRepository;
    private LessonsQuestionRepository lessonsQuestionRepository;
    private ContractService contractService;
    private ApplicationContext context;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setAudienceRepository(AudienceRepository audienceRepository) {
        this.audienceRepository = audienceRepository;
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
    public void setContractService(ContractService contractService) {
        this.contractService = contractService;
    }

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @GetMapping("/api/exercises/{exerciseId}/lessons_categories")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<LessonsCategory> exerciseLessonsCategories(@PathVariable String exerciseId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId));
    }

    @PostMapping("/api/exercises/{exerciseId}/lessons_apply_template/{lessonsTemplateId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Iterable<LessonsCategory> applyExerciseLessonsTemplate(@PathVariable String exerciseId, @PathVariable String lessonsTemplateId) {
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
            List<LessonsQuestion> lessonsQuestions = lessonsTemplateCategory.getQuestions().stream().map(lessonsTemplateQuestion -> {
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
    public LessonsCategory createExerciseLessonsCategory(@PathVariable String exerciseId, @Valid @RequestBody LessonsCategoryCreateInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        LessonsCategory lessonsCategory = new LessonsCategory();
        lessonsCategory.setUpdateAttributes(input);
        lessonsCategory.setExercise(exercise);
        return lessonsCategoryRepository.save(lessonsCategory);
    }

    @PostMapping("/api/exercises/{exerciseId}/lessons_answers_reset")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Iterable<LessonsCategory> resetExerciseLessonsAnswers(@PathVariable String exerciseId) {
        List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        for (LessonsCategory lessonsCategory : lessonsCategories) {

        }
        lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        return lessonsCategories;
    }

    @PostMapping("/api/exercises/{exerciseId}/lessons_empty")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Iterable<LessonsCategory> emptyExerciseLessons(@PathVariable String exerciseId) {
        List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        lessonsCategoryRepository.deleteAll(lessonsCategories);
        lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        return lessonsCategories;
    }

    @PutMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public LessonsCategory updateExerciseLessonsCategory(@PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryUpdateInput input) {
        LessonsCategory lessonsTemplateCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow();
        lessonsTemplateCategory.setUpdateAttributes(input);
        lessonsTemplateCategory.setUpdated(now());
        return lessonsCategoryRepository.save(lessonsTemplateCategory);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteExerciseLessonsCategory(@PathVariable String lessonsCategoryId) {
        lessonsCategoryRepository.deleteById(lessonsCategoryId);
    }

    @PutMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/audiences")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public LessonsCategory updateExerciseLessonsCategoryAudiences(@PathVariable String exerciseId, @PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsCategoryAudiencesInput input) {
        LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow();
        Iterable<Audience> lessonsCategoryAudiences = audienceRepository.findAllById(input.getAudienceIds());
        lessonsCategory.setAudiences(fromIterable(lessonsCategoryAudiences));
        return lessonsCategoryRepository.save(lessonsCategory);
    }

    @GetMapping("/api/exercises/{exerciseId}/lessons_questions")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<LessonsQuestion> exerciseLessonsQuestions(@PathVariable String exerciseId) {
        return lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().
                flatMap(lessonsCategory -> lessonsQuestionRepository.findAll(LessonsQuestionSpecification.fromCategory(lessonsCategory.getId())).stream()).toList();
    }

    @GetMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<LessonsQuestion> exerciseLessonsCategoryQuestions(@PathVariable String lessonsCategoryId) {
        return lessonsQuestionRepository.findAll(LessonsQuestionSpecification.fromCategory(lessonsCategoryId));
    }

    @PostMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public LessonsQuestion createExerciseLessonsQuestion(@PathVariable String lessonsCategoryId, @Valid @RequestBody LessonsQuestionCreateInput input) {
        LessonsCategory lessonsCategory = lessonsCategoryRepository.findById(lessonsCategoryId).orElseThrow();
        LessonsQuestion lessonsQuestion = new LessonsQuestion();
        lessonsQuestion.setUpdateAttributes(input);
        lessonsQuestion.setCategory(lessonsCategory);
        return lessonsQuestionRepository.save(lessonsQuestion);
    }

    @PutMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public LessonsQuestion updateExerciseLessonsQuestion(@PathVariable String lessonsQuestionId, @Valid @RequestBody LessonsQuestionUpdateInput input) {
        LessonsQuestion lessonsQuestion = lessonsQuestionRepository.findById(lessonsQuestionId).orElseThrow();
        lessonsQuestion.setUpdateAttributes(input);
        lessonsQuestion.setUpdated(now());
        return lessonsQuestionRepository.save(lessonsQuestion);
    }

    @DeleteMapping("/api/exercises/{exerciseId}/lessons_categories/{lessonsCategoryId}/lessons_questions/{lessonsQuestionId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteExerciseLessonsQuestion(@PathVariable String lessonsQuestionId) {
        lessonsQuestionRepository.deleteById(lessonsQuestionId);
    }

    @PostMapping("/api/exercises/{exerciseId}/lessons_send")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void sendExerciseLessons(@PathVariable String exerciseId, @Valid @RequestBody LessonsSendInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
        List<LessonsCategory> lessonsCategories = lessonsCategoryRepository.findAll(LessonsCategorySpecification.fromExercise(exerciseId)).stream().toList();
        for (LessonsCategory lessonsCategory : lessonsCategories) {
            List<Audience> audiences = lessonsCategory.getAudiences().stream().toList();
            for (Audience audience : audiences) {
                EmailContent emailContent = new EmailContent();
                emailContent.setSubject(input.getSubject());
                emailContent.setBody(input.getBody());
                Inject inject = new Inject();
                inject.setTitle("Lessons learned campaign");
                inject.setDescription("Direct inject for lessons learned questionnaire");
                inject.setContent(mapper.valueToTree(emailContent));
                inject.setContract(EmailContract.EMAIL_DEFAULT);
                inject.setUser(currentUser());
                inject.setDirect(true);
                Contract contract = contractService.resolveContract(inject);
                if (contract == null) {
                    throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
                }
                inject.setType(contract.getConfig().getType());
                inject.setExercise(exercise);
                List<ExecutionContext> userInjectContexts = audience.getUsers().stream()
                        .map(user -> new ExecutionContext(openExConfig, user, inject, "Direct execution")).toList();
                ExecutableInject injection = new ExecutableInject(true, true, inject, contract, List.of(), userInjectContexts);
                Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
                executor.executeInjection(injection);
            }
        }
    }
}
