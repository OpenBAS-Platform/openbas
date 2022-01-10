package io.openex.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.Email;
import javax.validation.constraints.FutureOrPresent;
import javax.validation.constraints.NotBlank;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static io.openex.config.AppConfig.*;

public class ExerciseUpdateInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("exercise_name")
    private String name;

    @JsonProperty("exercise_subtitle")
    private String subtitle;

    @JsonProperty("exercise_description")
    private String description;

    @JsonProperty("exercise_start_date")
    @FutureOrPresent(message = NOW_FUTURE_MESSAGE)
    private Instant start;

    @Email(message = EMAIL_FORMAT)
    @JsonProperty("exercise_mail_from")
    private String mailFrom;

    @JsonProperty("exercise_message_header")
    private String messageHeader;

    @JsonProperty("exercise_message_footer")
    private String messageFooter;

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
        return start != null ? start.truncatedTo(ChronoUnit.MINUTES) : null;
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    public String getMessageFooter() {
        return messageFooter;
    }

    public void setMessageFooter(String messageFooter) {
        this.messageFooter = messageFooter;
    }

    public String getMessageHeader() {
        return messageHeader;
    }

    public String getMailFrom() {
        return mailFrom;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }
}
