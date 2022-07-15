package io.openex.execution;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Article;
import io.openex.database.model.Exercise;
import io.openex.database.model.Injection;
import io.openex.database.model.User;

import java.util.HashMap;
import java.util.List;

public class ExecutionContext extends HashMap<String, Object> {

    // Reserved words
    private final OpenExConfig config;
    public static final String USER = "user";
    public static final String EXERCISE = "exercise";
    public static final String AUDIENCES = "audiences";
    public static final String COMCHECK = "comcheck";

    public ExecutionContext(OpenExConfig config, User user, Exercise exercise, List<String> audiences) {
        this.config = config;
        this.put(USER, user);
        this.put(EXERCISE, exercise);
        this.put(AUDIENCES, audiences);
    }

    public ExecutionContext(OpenExConfig config, User user, Injection injection, List<String> audiences) {
        this(config, user, injection.getExercise(), audiences);
        String exerciseId = injection.getExercise().getId();
        String playerUri = config.getBaseUrl() + "/private/" + exerciseId + "/" + injection.getId() + "?user=" + user.getId();
        this.put("player_uri", playerUri);
    }

    public ExecutionContext(OpenExConfig config, User user, Exercise exercise, String audience) {
        this(config, user, exercise, List.of(audience));
    }

    public ExecutionContext(OpenExConfig baseUri, User user, Injection injection, String audience) {
        this(baseUri, user, injection, List.of(audience));
    }

    public void putArticle(Article article) {
        this.put("article", article);
        String userId = getUser().getId();
        String mediaId = article.getMedia().getId();
        String exerciseId = article.getExercise().getId();
        String queryOptions = "article=" + article.getId() + "&user=" + userId;
        String articleUri = config.getBaseUrl() + "/media/" + exerciseId + "/" + mediaId + "?" + queryOptions;
        this.put("article_uri", articleUri);
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
