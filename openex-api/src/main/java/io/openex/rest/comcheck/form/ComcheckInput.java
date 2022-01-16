package io.openex.rest.comcheck.form;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ComcheckInput {

    @JsonProperty("comcheck_end_date")
    private Instant end;

    @JsonProperty("comcheck_subject")
    private String subject;

    @JsonProperty("comcheck_message")
    private String message;

    @JsonProperty("comcheck_footer")
    private String signature;

    @JsonProperty("comcheck_audience")
    private List<String> audienceIds = new ArrayList<>();

    public List<String> getAudienceIds() {
        return audienceIds;
    }

    public void setAudienceIds(List<String> audienceIds) {
        this.audienceIds = audienceIds;
    }

    public Instant getEnd() {
        return end;
    }

    public void setEnd(Instant end) {
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
