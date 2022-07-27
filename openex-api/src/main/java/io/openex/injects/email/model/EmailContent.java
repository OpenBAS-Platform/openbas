package io.openex.injects.email.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Inject;
import org.springframework.util.StringUtils;

import java.util.Objects;

public class EmailContent {

    private static final String HEADER_DIV = "<div style=\"text-align: center; margin-bottom: 10px;\">";
    private static final String START_DIV = "<div>";
    private static final String END_DIV = "</div>";

    @JsonProperty("body")
    private String body;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("inReplyTo")
    private String inReplyTo;

    @JsonProperty("encrypted")
    private boolean encrypted;

    @JsonProperty("expectationType")
    private String expectationType;

    public EmailContent() {
        // For mapper
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getInReplyTo() {
        return inReplyTo;
    }

    public void setInReplyTo(String inReplyTo) {
        this.inReplyTo = inReplyTo;
    }

    public boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(boolean encrypted) {
        this.encrypted = encrypted;
    }

    public String buildMessage(Inject inject, boolean imapEnabled) {
        // String footer = inject.getFooter();
        String header = inject.getHeader();
        StringBuilder data = new StringBuilder();
        if (StringUtils.hasLength(header)) {
            data.append(HEADER_DIV).append(header).append(END_DIV);
        }
        data.append(START_DIV).append(body).append(END_DIV);
        // if (StringUtils.hasLength(footer)) {
        //    data.append(FOOTER_DIV).append(footer).append(END_DIV);
        // }
        // If imap is enable we need to inject the id marker
        if (imapEnabled && !inject.isDirect()) {
            data.append(START_DIV)
                    .append("<br/><br/><br/><br/>")
                    .append("---------------------------------------------------------------------------------<br/>")
                    .append("OpenEx internal information, do not remove!<br/>")
                    .append("[inject_id=").append(inject.getId()).append("]<br/>")
                    .append("---------------------------------------------------------------------------------<br/>")
                    .append(END_DIV);
        }
        return data.toString();
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getExpectationType() {
        return expectationType;
    }

    public void setExpectationType(String expectationType) {
        this.expectationType = expectationType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EmailContent that = (EmailContent) o;
        return encrypted == that.encrypted && Objects.equals(body, that.body)
                && Objects.equals(subject, that.subject);
    }

    @Override
    public int hashCode() {
        return Objects.hash(body, subject, encrypted);
    }
}
