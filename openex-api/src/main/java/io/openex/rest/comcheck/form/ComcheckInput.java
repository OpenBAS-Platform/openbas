package io.openex.rest.comcheck.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotBlank;
import java.util.Date;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

public class ComcheckInput {

    @NotBlank(message = MANDATORY_MESSAGE)
    @JsonProperty("comcheck_audience")
    private String audienceId;

    @JsonProperty("comcheck_end_date")
    private Date end;

    @JsonProperty("comcheck_subject")
    private String subject;

    @JsonProperty("comcheck_message")
    private String message;

    @JsonProperty("comcheck_footer")
    private String signature;

    public String getAudienceId() {
        return audienceId;
    }

    public void setAudienceId(String audienceId) {
        this.audienceId = audienceId;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
