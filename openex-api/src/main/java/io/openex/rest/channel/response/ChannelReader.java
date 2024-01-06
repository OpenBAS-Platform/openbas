package io.openex.rest.channel.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Exercise;
import io.openex.database.model.Channel;
import io.openex.database.model.Article;

import java.util.ArrayList;
import java.util.List;

public class ChannelReader {

    @JsonProperty("channel_id")
    private String id;

    @JsonProperty("channel_information")
    private Channel channel;

    @JsonProperty("channel_exercise")
    private Exercise exercise;

    @JsonProperty("channel_articles")
    private List<Article> channelArticles = new ArrayList<>();

    public ChannelReader(Channel channel, Exercise exercise) {
        this.id = channel.getId();
        this.channel = channel;
        this.exercise = exercise;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public List<Article> getChannelArticles() {
        return channelArticles;
    }

    public void setChannelArticles(List<Article> channelArticles) {
        this.channelArticles = channelArticles;
    }

    public String getId() {
        return id;
    }

    public Channel getChannel() {
        return channel;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
    }
}
