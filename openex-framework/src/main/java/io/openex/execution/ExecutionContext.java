package io.openex.execution;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Exercise;
import io.openex.database.model.Injection;
import io.openex.database.model.User;

import java.util.HashMap;
import java.util.List;

public class ExecutionContext extends HashMap<String, Object> {

    public static final String USER = "user";
    public static final String EXERCISE = "exercise";
    public static final String AUDIENCES = "audiences";
    public static final String COMCHECK = "comcheck";

    public ExecutionContext(User user, Exercise exercise, List<String> audiences) {
        this.put(USER, user);
        this.put(EXERCISE, exercise);
        this.put(AUDIENCES, audiences);
    }

    public ExecutionContext(OpenExConfig config, User user, Injection injection, List<String> audiences) {
        this(user, injection.getExercise(), audiences);
        String exerciseId = injection.getExercise().getId();
        String playerUri = config.getBaseUrl() + "/private/" + exerciseId + "/" + injection.getId() + "?user=" + user.getId();
        this.put("player_uri", playerUri);
    }

    public ExecutionContext(User user, Exercise exercise, String audience) {
        this(user, exercise, List.of(audience));
    }

    public ExecutionContext(OpenExConfig baseUri, User user, Injection injection, String audience) {
        this(baseUri, user, injection, List.of(audience));
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
