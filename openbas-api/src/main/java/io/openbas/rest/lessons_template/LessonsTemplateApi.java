package io.openbas.rest.lessons_template;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

import io.openbas.database.model.LessonsTemplate;
import io.openbas.database.model.LessonsTemplateCategory;
import io.openbas.database.model.LessonsTemplateQuestion;
import io.openbas.database.repository.LessonsTemplateCategoryRepository;
import io.openbas.database.repository.LessonsTemplateQuestionRepository;
import io.openbas.database.repository.LessonsTemplateRepository;
import io.openbas.database.specification.LessonsTemplateCategorySpecification;
import io.openbas.database.specification.LessonsTemplateQuestionSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.lessons_template.form.LessonsTemplateCategoryInput;
import io.openbas.rest.lessons_template.form.LessonsTemplateInput;
import io.openbas.rest.lessons_template.form.LessonsTemplateQuestionInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class LessonsTemplateApi extends RestBehavior {

  public static final String LESSON_TEMPLATE_URI = "/api/lessons_templates";

  private final LessonsTemplateRepository lessonsTemplateRepository;
  private final LessonsTemplateCategoryRepository lessonsTemplateCategoryRepository;
  private final LessonsTemplateQuestionRepository lessonsTemplateQuestionRepository;

  // -- LESSONS TEMPLATES --

  @Secured(ROLE_ADMIN)
  @PostMapping(LESSON_TEMPLATE_URI)
  @Transactional(rollbackOn = Exception.class)
  public LessonsTemplate createLessonsTemplate(@Valid @RequestBody LessonsTemplateInput input) {
    LessonsTemplate lessonsTemplate = new LessonsTemplate();
    lessonsTemplate.setUpdateAttributes(input);
    return lessonsTemplateRepository.save(lessonsTemplate);
  }

  @GetMapping(LESSON_TEMPLATE_URI)
  public Iterable<LessonsTemplate> lessonsTemplates() {
    return fromIterable(lessonsTemplateRepository.findAll()).stream().toList();
  }

  @PostMapping(LESSON_TEMPLATE_URI + "/search")
  public Page<LessonsTemplate> lessonsTemplates(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.lessonsTemplateRepository::findAll, searchPaginationInput, LessonsTemplate.class);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(LESSON_TEMPLATE_URI + "/{lessonsTemplateId}")
  public LessonsTemplate updateLessonsTemplate(
      @PathVariable String lessonsTemplateId, @Valid @RequestBody LessonsTemplateInput input) {
    LessonsTemplate lessonsTemplate =
        lessonsTemplateRepository
            .findById(lessonsTemplateId)
            .orElseThrow(ElementNotFoundException::new);
    lessonsTemplate.setUpdateAttributes(input);
    lessonsTemplate.setUpdated(now());
    return lessonsTemplateRepository.save(lessonsTemplate);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(LESSON_TEMPLATE_URI + "/{lessonsTemplateId}")
  public void deleteLessonsTemplate(@PathVariable String lessonsTemplateId) {
    lessonsTemplateRepository.deleteById(lessonsTemplateId);
  }

  // -- LESSONS TEMPLATES CATEGORIES --

  public static final String LESSON_CATEGORY_URI =
      LESSON_TEMPLATE_URI + "/{lessonsTemplateId}/lessons_template_categories";

  @Secured(ROLE_ADMIN)
  @PostMapping(LESSON_CATEGORY_URI)
  @Transactional(rollbackOn = Exception.class)
  public LessonsTemplateCategory createLessonsTemplateCategory(
      @PathVariable String lessonsTemplateId,
      @Valid @RequestBody LessonsTemplateCategoryInput input) {
    LessonsTemplate lessonsTemplate =
        lessonsTemplateRepository
            .findById(lessonsTemplateId)
            .orElseThrow(ElementNotFoundException::new);
    LessonsTemplateCategory lessonsTemplateCategory = new LessonsTemplateCategory();
    lessonsTemplateCategory.setUpdateAttributes(input);
    lessonsTemplateCategory.setTemplate(lessonsTemplate);
    return lessonsTemplateCategoryRepository.save(lessonsTemplateCategory);
  }

  @GetMapping(LESSON_CATEGORY_URI)
  public Iterable<LessonsTemplateCategory> lessonsTemplateCategories(
      @PathVariable String lessonsTemplateId) {
    return lessonsTemplateCategoryRepository.findAll(
        LessonsTemplateCategorySpecification.fromTemplate(lessonsTemplateId));
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(LESSON_CATEGORY_URI + "/{lessonsTemplateCategoryId}")
  @Transactional(rollbackOn = Exception.class)
  public LessonsTemplateCategory updateLessonsTemplateCategory(
      @PathVariable String lessonsTemplateId,
      @PathVariable String lessonsTemplateCategoryId,
      @Valid @RequestBody LessonsTemplateCategoryInput input) {
    LessonsTemplateCategory lessonsTemplateCategory =
        lessonsTemplateCategoryRepository
            .findById(lessonsTemplateCategoryId)
            .orElseThrow(ElementNotFoundException::new);
    lessonsTemplateCategory.setUpdateAttributes(input);
    lessonsTemplateCategory.setUpdated(now());
    return lessonsTemplateCategoryRepository.save(lessonsTemplateCategory);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(LESSON_CATEGORY_URI + "/{lessonsTemplateCategoryId}")
  public void deleteLessonsTemplateCategory(
      @PathVariable String lessonsTemplateId, @PathVariable String lessonsTemplateCategoryId) {
    lessonsTemplateCategoryRepository.deleteById(lessonsTemplateCategoryId);
  }

  // -- LESSONS TEMPLATES QUESTIONS --

  @GetMapping(LESSON_TEMPLATE_URI + "/{lessonsTemplateId}/lessons_template_questions")
  public Iterable<LessonsTemplateQuestion> lessonsTemplateQuestions(
      @PathVariable String lessonsTemplateId) {
    return lessonsTemplateCategoryRepository
        .findAll(LessonsTemplateCategorySpecification.fromTemplate(lessonsTemplateId))
        .stream()
        .flatMap(
            lessonsTemplateCategory ->
                lessonsTemplateQuestionRepository
                    .findAll(
                        LessonsTemplateQuestionSpecification.fromCategory(
                            lessonsTemplateCategory.getId()))
                    .stream())
        .toList();
  }

  public static final String LESSON_QUESTION_URI =
      LESSON_CATEGORY_URI + "/{lessonsTemplateCategoryId}/lessons_template_questions";

  @Secured(ROLE_ADMIN)
  @PostMapping(LESSON_QUESTION_URI)
  public LessonsTemplateQuestion createLessonsTemplateQuestion(
      @PathVariable String lessonsTemplateId,
      @PathVariable String lessonsTemplateCategoryId,
      @Valid @RequestBody LessonsTemplateQuestionInput input) {
    LessonsTemplateCategory lessonsTemplateCategory =
        lessonsTemplateCategoryRepository
            .findById(lessonsTemplateCategoryId)
            .orElseThrow(ElementNotFoundException::new);
    LessonsTemplateQuestion lessonsTemplateQuestion = new LessonsTemplateQuestion();
    lessonsTemplateQuestion.setUpdateAttributes(input);
    lessonsTemplateQuestion.setCategory(lessonsTemplateCategory);
    return lessonsTemplateQuestionRepository.save(lessonsTemplateQuestion);
  }

  @GetMapping(LESSON_QUESTION_URI)
  public Iterable<LessonsTemplateQuestion> lessonsTemplateCategoryQuestions(
      @PathVariable String lessonsTemplateId, @PathVariable String lessonsTemplateCategoryId) {
    return lessonsTemplateQuestionRepository.findAll(
        LessonsTemplateQuestionSpecification.fromCategory(lessonsTemplateCategoryId));
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(LESSON_QUESTION_URI + "/{lessonsTemplateQuestionId}")
  public LessonsTemplateQuestion updateLessonsTemplateQuestion(
      @PathVariable String lessonsTemplateId,
      @PathVariable String lessonsTemplateCategoryId,
      @PathVariable String lessonsTemplateQuestionId,
      @Valid @RequestBody LessonsTemplateQuestionInput input) {
    LessonsTemplateQuestion lessonsTemplateQuestion =
        lessonsTemplateQuestionRepository
            .findById(lessonsTemplateQuestionId)
            .orElseThrow(ElementNotFoundException::new);
    lessonsTemplateQuestion.setUpdateAttributes(input);
    lessonsTemplateQuestion.setUpdated(now());
    return lessonsTemplateQuestionRepository.save(lessonsTemplateQuestion);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(LESSON_QUESTION_URI + "/{lessonsTemplateQuestionId}")
  public void deleteLessonsTemplateQuestion(
      @PathVariable String lessonsTemplateId,
      @PathVariable String lessonsTemplateCategoryId,
      @PathVariable String lessonsTemplateQuestionId) {
    lessonsTemplateQuestionRepository.deleteById(lessonsTemplateQuestionId);
  }
}
