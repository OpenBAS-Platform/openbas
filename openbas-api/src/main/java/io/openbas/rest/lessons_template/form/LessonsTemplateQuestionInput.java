package io.openbas.rest.lessons_template.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class LessonsTemplateQuestionInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("lessons_template_question_content")
    private String content;

    @JsonProperty("lessons_template_question_explanation")
    private String explanation;

    @JsonProperty("lessons_template_question_order")
    @NotNull
    private int order;

}
