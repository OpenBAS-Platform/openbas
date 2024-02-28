package io.openbas.rest.lessons_template.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

public class LessonsTemplateQuestionUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("lessons_template_question_content")
    private String content;

    @JsonProperty("lessons_template_question_explanation")
    private String explanation;

    @JsonProperty("lessons_template_question_order")
    private int order;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }
}
