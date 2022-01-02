package io.openex.rest.exercise.export;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ExerciseImport {

    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_description")
    private String description;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_start_date")
    private Date start;

    @JsonProperty("exercise_end_date")
    private Date end;

    @JsonProperty("exercise_canceled")
    private boolean canceled;

    @JsonProperty("exercise_owner")
    private String owner;

    @JsonProperty("exercise_image")
    private String image;

    @JsonProperty("exercise_animation_group")
    private String animationGroup;

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

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }

    public boolean isCanceled() {
        return canceled;
    }

    public void setCanceled(boolean canceled) {
        this.canceled = canceled;
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

    public String getAnimationGroup() {
        return animationGroup;
    }

    public void setAnimationGroup(String animationGroup) {
        this.animationGroup = animationGroup;
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
