package io.openex.rest.lessons.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class LessonsAnswerCreateInput {

    @JsonProperty("lessons_answer_score")
    private int score;

    @JsonProperty("lessons_answer_positive")
    private String positive;

    @JsonProperty("lessons_answer_negative")
    private String negative;

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getPositive() {
        return positive;
    }

    public void setPositive(String positive) {
        this.positive = positive;
    }

    public String getNegative() {
        return negative;
    }

    public void setNegative(String negative) {
        this.negative = negative;
    }
}
