package io.openex.rest.comcheck.form;

import javax.validation.constraints.NotBlank;
import java.util.Date;

public class ComcheckInput {

    @NotBlank(message = "This value should not be blank.")
    private String exerciseId;

    @NotBlank(message = "This value should not be blank.")
    private String targetAudienceId;

    private Date end;
    private String subject;
    private String message;
    private String signature;

    public String getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }

    public String getTargetAudienceId() {
        return targetAudienceId;
    }

    public void setTargetAudienceId(String targetAudienceId) {
        this.targetAudienceId = targetAudienceId;
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
