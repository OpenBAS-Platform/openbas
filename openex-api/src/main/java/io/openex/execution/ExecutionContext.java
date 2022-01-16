package io.openex.execution;

import io.openex.database.model.Exercise;
import io.openex.database.model.User;

import java.util.HashMap;
import java.util.List;

public class ExecutionContext extends HashMap<String, Object> {

    // Reserved words
    public static final String USER = "user";
    public static final String EXERCISE = "exercise";
    public static final String AUDIENCES = "audiences";
    public static final String COMCHECK = "comcheck";

    public ExecutionContext(User user, Exercise exercise, List<String> audiences) {
        this.put(USER, user);
        this.put(EXERCISE, exercise);
        this.put(AUDIENCES, audiences);
    }

    public ExecutionContext(User user, Exercise exercise, String audience) {
        this(user, exercise, List.of(audience));
    }

    public User getUser() {
        return (User) this.get(USER);
    }

    public List<String> getAudiences() {
        //noinspection unchecked
        return (List<String>) this.get(AUDIENCES);
    }

    public Exercise getExercise() {
        return (Exercise) this.get(EXERCISE);
    }
}
