package io.openbas.rest.lessons_template;

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
import io.openbas.rest.lessons_template.form.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;
import static java.time.Instant.now;

@RestController
public class LessonsTemplateApi extends RestBehavior {

    private LessonsTemplateRepository lessonsTemplateRepository;
    private LessonsTemplateCategoryRepository lessonsTemplateCategoryRepository;
    private LessonsTemplateQuestionRepository lessonsTemplateQuestionRepository;

    @Autowired
    public void setLessonsTemplateRepository(LessonsTemplateRepository lessonsTemplateRepository) {
        this.lessonsTemplateRepository = lessonsTemplateRepository;
    }

    @Autowired
    public void setLessonsTemplateCategoryRepository(LessonsTemplateCategoryRepository lessonsTemplateCategoryRepository) {
        this.lessonsTemplateCategoryRepository = lessonsTemplateCategoryRepository;
    }

    @Autowired
    public void setLessonsTemplateQuestionRepository(LessonsTemplateQuestionRepository lessonsTemplateQuestionRepository) {
        this.lessonsTemplateQuestionRepository = lessonsTemplateQuestionRepository;
    }

    @GetMapping("/api/lessons_templates")
    public Iterable<LessonsTemplate> lessonsTemplates() {
        return fromIterable(lessonsTemplateRepository.findAll()).stream().toList();
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/lessons_templates")
    public LessonsTemplate createLessonsTemplate(@Valid @RequestBody LessonsTemplateCreateInput input) {
        LessonsTemplate lessonsTemplate = new LessonsTemplate();
        lessonsTemplate.setUpdateAttributes(input);
        return lessonsTemplateRepository.save(lessonsTemplate);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/lessons_templates/{lessonsTemplateId}")
    public LessonsTemplate updateLessonsTemplate(@PathVariable String lessonsTemplateId,
                                                 @Valid @RequestBody LessonsTemplateUpdateInput input) {
        LessonsTemplate lessonsTemplate = lessonsTemplateRepository.findById(lessonsTemplateId).orElseThrow(ElementNotFoundException::new);
        lessonsTemplate.setUpdateAttributes(input);
        lessonsTemplate.setUpdated(now());
        return lessonsTemplateRepository.save(lessonsTemplate);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/lessons_templates/{lessonsTemplateId}")
    public void deleteLessonsTemplate(@PathVariable String lessonsTemplateId) {
        lessonsTemplateRepository.deleteById(lessonsTemplateId);
    }

    @GetMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories")
    public Iterable<LessonsTemplateCategory> lessonsTemplateCategories(@PathVariable String lessonsTemplateId) {
        return lessonsTemplateCategoryRepository.findAll(LessonsTemplateCategorySpecification.fromTemplate(lessonsTemplateId));
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories")
    public LessonsTemplateCategory createLessonsTemplateCategory(@PathVariable String lessonsTemplateId, @Valid @RequestBody LessonsTemplateCategoryCreateInput input) {
        LessonsTemplate lessonsTemplate = lessonsTemplateRepository.findById(lessonsTemplateId).orElseThrow(ElementNotFoundException::new);
        LessonsTemplateCategory lessonsTemplateCategory = new LessonsTemplateCategory();
        lessonsTemplateCategory.setUpdateAttributes(input);
        lessonsTemplateCategory.setTemplate(lessonsTemplate);
        return lessonsTemplateCategoryRepository.save(lessonsTemplateCategory);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}")
    public LessonsTemplateCategory updateLessonsTemplateCategory(@PathVariable String lessonsTemplateCategoryId, @Valid @RequestBody LessonsTemplateCategoryUpdateInput input) {
        LessonsTemplateCategory lessonsTemplateCategory = lessonsTemplateCategoryRepository.findById(lessonsTemplateCategoryId).orElseThrow(ElementNotFoundException::new);
        lessonsTemplateCategory.setUpdateAttributes(input);
        lessonsTemplateCategory.setUpdated(now());
        return lessonsTemplateCategoryRepository.save(lessonsTemplateCategory);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}")
    public void deleteLessonsTemplateCategory(@PathVariable String lessonsTemplateCategoryId) {
        lessonsTemplateCategoryRepository.deleteById(lessonsTemplateCategoryId);
    }

    @GetMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_questions")
    public Iterable<LessonsTemplateQuestion> lessonsTemplateQuestions(@PathVariable String lessonsTemplateId) {
        return lessonsTemplateCategoryRepository.findAll(LessonsTemplateCategorySpecification.fromTemplate(lessonsTemplateId)).stream().
                flatMap(lessonsTemplateCategory -> lessonsTemplateQuestionRepository.findAll(LessonsTemplateQuestionSpecification.fromCategory(lessonsTemplateCategory.getId())).stream()).toList();
    }

    @GetMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions")
    public Iterable<LessonsTemplateQuestion> lessonsTemplateCategoryQuestions(@PathVariable String lessonsTemplateCategoryId) {
        return lessonsTemplateQuestionRepository.findAll(LessonsTemplateQuestionSpecification.fromCategory(lessonsTemplateCategoryId));
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions")
    public LessonsTemplateQuestion createLessonsTemplateQuestion(@PathVariable String lessonsTemplateCategoryId, @Valid @RequestBody LessonsTemplateQuestionCreateInput input) {
        LessonsTemplateCategory lessonsTemplateCategory = lessonsTemplateCategoryRepository.findById(lessonsTemplateCategoryId).orElseThrow(ElementNotFoundException::new);
        LessonsTemplateQuestion lessonsTemplateQuestion = new LessonsTemplateQuestion();
        lessonsTemplateQuestion.setUpdateAttributes(input);
        lessonsTemplateQuestion.setCategory(lessonsTemplateCategory);
        return lessonsTemplateQuestionRepository.save(lessonsTemplateQuestion);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions/{lessonsTemplateQuestionId}")
    public LessonsTemplateQuestion updateLessonsTemplateQuestion(@PathVariable String lessonsTemplateQuestionId, @Valid @RequestBody LessonsTemplateQuestionUpdateInput input) {
        LessonsTemplateQuestion lessonsTemplateQuestion = lessonsTemplateQuestionRepository.findById(lessonsTemplateQuestionId).orElseThrow(ElementNotFoundException::new);
        lessonsTemplateQuestion.setUpdateAttributes(input);
        lessonsTemplateQuestion.setUpdated(now());
        return lessonsTemplateQuestionRepository.save(lessonsTemplateQuestion);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/lessons_templates/{lessonsTemplateId}/lessons_template_categories/{lessonsTemplateCategoryId}/lessons_template_questions/{lessonsTemplateQuestionId}")
    public void deleteLessonsTemplateQuestion(@PathVariable String lessonsTemplateQuestionId) {
        lessonsTemplateQuestionRepository.deleteById(lessonsTemplateQuestionId);
    }
}
