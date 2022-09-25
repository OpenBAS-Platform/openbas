package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import static io.openex.config.AppConfig.EMAIL_FORMAT;
import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ExerciseLessonsInput {
    @JsonProperty("exercise_lessons_anonymized")
    private boolean lessonsAnonymized;

    public boolean getLessonsAnonymized() {
        return lessonsAnonymized;
    }

    public void setLessonsAnonymized(boolean lessonsAnonymized) {
        this.lessonsAnonymized = lessonsAnonymized;
    }
}
