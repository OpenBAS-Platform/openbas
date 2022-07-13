package io.openex.rest.media.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Exercise;
import io.openex.database.model.Media;
import io.openex.database.model.Article;

import java.util.ArrayList;
import java.util.List;

public class MediaReader {

    @JsonProperty("media_id")
    private String id;

    @JsonProperty("exercise_status")
    private Exercise.STATUS exerciseStatus;

    @JsonProperty("media_information")
    private Media media;

    @JsonProperty("media_articles")
    private List<Article> mediaArticles = new ArrayList<>();

    public MediaReader(Exercise.STATUS exerciseStatus, Media media) {
        this.exerciseStatus = exerciseStatus;
        this.id = media.getId();
        this.media = media;
    }

    public Exercise.STATUS getExerciseStatus() {
        return exerciseStatus;
    }

    public void setExerciseStatus(Exercise.STATUS exerciseStatus) {
        this.exerciseStatus = exerciseStatus;
    }

    public List<Article> getMediaArticles() {
        return mediaArticles;
    }

    public void setMediaArticles(List<Article> mediaArticles) {
        this.mediaArticles = mediaArticles;
    }

    public String getId() {
        return id;
    }

    public Media getMedia() {
        return media;
    }

    public void setMedia(Media media) {
        this.media = media;
    }
}
