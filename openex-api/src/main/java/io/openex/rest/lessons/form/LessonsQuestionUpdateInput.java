package io.openex.rest.lessons.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class LessonsQuestionUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("lessons_question_content")
    private String content;

    @JsonProperty("lessons_question_explanation")
    private String explanation;

    @JsonProperty("lessons_question_order")
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
