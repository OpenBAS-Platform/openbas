package io.openex.rest.exercise.export;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ExerciseImport {

    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_description")
    private String description;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_start_date")
    private Instant start;

    @JsonProperty("exercise_end_date")
    private Instant end;

    @JsonProperty("exercise_owner")
    private String owner;

    @JsonProperty("exercise_image")
    private String image;

    @JsonProperty("exercise_message_header")
    private String header;

    @JsonProperty("exercise_message_footer")
    private String footer;

    @JsonProperty("exercise_mail_from")
    private String replyTo;

    @JsonProperty("exercises_tags")
    private List<String> tags = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public Instant getStart() {
        return start;
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    public Instant getEnd() {
        return end;
    }

    public void setEnd(Instant end) {
        this.end = end;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getHeader() {
        return header;
    }

    public void setHeader(String header) {
        this.header = header;
    }

    public String getFooter() {
        return footer;
    }

    public void setFooter(String footer) {
        this.footer = footer;
    }

    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
