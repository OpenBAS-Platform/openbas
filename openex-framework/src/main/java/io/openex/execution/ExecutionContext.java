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
    public static final String PLAYER_URI = "player_uri";
    public static final String CHALLENGES_URI = "challenges_uri";
    public static final String SCOREBOARD_URI = "scoreboard_uri";

    private ExecutionContext(User user, Exercise exercise, List<String> audiences) {
        User protectUser = new User();
        protectUser.setId(user.getId());
        protectUser.setEmail(user.getEmail());
        protectUser.setFirstname(user.getFirstname());
        protectUser.setLastname(user.getLastname());
        protectUser.setLang(user.getLang());
        this.put(USER, protectUser);
        this.put(EXERCISE, exercise);
        this.put(AUDIENCES, audiences);
    }

    public ExecutionContext(OpenExConfig config, User user, Injection injection, List<String> audiences) {
        this(user, injection.getExercise(), audiences);
        String exerciseId = injection.getExercise().getId();
        String queryParams = "?user=" + user.getId() + "&inject=" + injection.getId();
        this.put(PLAYER_URI, config.getBaseUrl() + "/private/" + exerciseId + queryParams);
        this.put(CHALLENGES_URI, config.getBaseUrl() + "/challenges/" + exerciseId + queryParams);
        this.put(SCOREBOARD_URI, config.getBaseUrl() + "/scoreboard/" + exerciseId + queryParams);
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
