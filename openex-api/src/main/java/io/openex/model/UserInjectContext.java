package io.openex.model;

import io.openex.database.model.Exercise;
import io.openex.database.model.User;

import java.util.List;

public class UserInjectContext {
    private User user;
    private Exercise exercise;
    private List<String> audiences;

    public UserInjectContext(User user, Exercise exercise, List<String> audiences) {
        this.user = user;
        this.exercise = exercise;
        this.audiences = audiences;
    }

    public UserInjectContext(User user, Exercise exercise, String audience) {
        this(user, exercise, List.of(audience));
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
