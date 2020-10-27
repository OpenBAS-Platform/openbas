package io.openex.player.injects.email;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.player.injects.email.model.EmailInjectAttachment;
import io.openex.player.model.inject.InjectBase;
import io.openex.player.utils.Executor;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EmailInject extends InjectBase {

    private static final String HEADER_STYLE = "style=\"text-align: center; margin-bottom: 10px;\">";
    private static final String FOOTER_STYLE = "style=\"text-align: center; margin-top: 10px;\">";
    private static final String START_DIV = "<div ";
    private static final String END_DIV = "</div>";

    private String subject;
    private String body;
    private String replyTo;
    private String contentHeader;
    private String contentFooter;
    private List<EmailInjectAttachment> attachments;

    @Override
    public Class<? extends Executor<EmailInject>> executor() {
        return EmailExecutor.class;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        StringBuilder data = new StringBuilder();
        if (contentHeader != null) {
            data.append(START_DIV).append(HEADER_STYLE).append(contentHeader).append(END_DIV);
        }
        data.append(body);
        if (contentFooter != null) {
            data.append(START_DIV).append(FOOTER_STYLE).append(contentFooter).append(END_DIV);
        }
        return data.toString();
    }

    public void setBody(String body) {
        this.body = body;
    }

    public List<EmailInjectAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<EmailInjectAttachment> attachments) {
        this.attachments = attachments;
    }

    @JsonProperty("content_header")
    public String getContentHeader() {
        return contentHeader;
    }

    public void setContentHeader(String contentHeader) {
        this.contentHeader = contentHeader;
    }

    @JsonProperty("content_footer")
    public String getContentFooter() {
        return contentFooter;
    }

    public void setContentFooter(String contentFooter) {
        this.contentFooter = contentFooter;
    }

    @JsonProperty("replyto")
    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }
}
