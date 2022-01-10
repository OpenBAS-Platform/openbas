package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.base.AttachmentContent;
import io.openex.injects.base.InjectAttachment;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class EmailContent implements AttachmentContent {

    private static final String HEADER_DIV = "<div style=\"text-align: center; margin-bottom: 10px;\">";
    private static final String FOOTER_DIV = "<div style=\"text-align: center; margin-top: 10px;\">";
    private static final String START_DIV = "<div>";
    private static final String END_DIV = "</div>";

    @JsonProperty("body")
    private String body;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("encrypted")
    private boolean encrypted;

    @JsonProperty("attachments")
    private List<InjectAttachment> attachments = new ArrayList<>();

    public EmailContent() {
        // For mapper
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(boolean encrypted) {
        this.encrypted = encrypted;
    }

    public String buildMessage(String footer, String header) {
        StringBuilder data = new StringBuilder();
        if (StringUtils.hasLength(header)) {
            data.append(HEADER_DIV).append(header).append(END_DIV);
        }
        data.append(START_DIV).append(body).append(END_DIV);
        if (StringUtils.hasLength(footer)) {
            data.append(FOOTER_DIV).append(footer).append(END_DIV);
        }
        return data.toString();
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    @Override
    public List<InjectAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<InjectAttachment> attachments) {
        this.attachments = attachments;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmailContent that = (EmailContent) o;
        return encrypted == that.encrypted && body.equals(that.body) && subject.equals(that.subject)
                && attachments.equals(that.attachments);
    }

    @Override
    public int hashCode() {
        return Objects.hash(body, subject, encrypted, attachments);
    }
}
