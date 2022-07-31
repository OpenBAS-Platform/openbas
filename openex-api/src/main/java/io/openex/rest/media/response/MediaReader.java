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

    @JsonProperty("media_information")
    private Media media;

    @JsonProperty("media_exercise")
    private Exercise exercise;

    @JsonProperty("media_articles")
    private List<Article> mediaArticles = new ArrayList<>();

    public MediaReader(Media media, Exercise exercise) {
        this.id = media.getId();
        this.media = media;
        this.exercise = exercise;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
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
