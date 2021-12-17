package io.openex.model;

import io.openex.database.model.Exercise;
import io.openex.database.model.User;

import java.util.List;

public class UserInjectContext {
    private User user;
    private Exercise exercise;
    private List<String> audiences;

    public UserInjectContext(Exercise exercise, User user, List<String> audiences) {
        this.exercise = exercise;
        this.user = user;
        this.audiences = audiences;
    }

    public UserInjectContext(Exercise exercise, User user, String audience) {
        this(exercise, user, List.of(audience));
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<String> getAudiences() {
        return audiences;
    }

    public void setAudiences(List<String> audiences) {
        this.audiences = audiences;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }
}
