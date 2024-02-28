package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

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
