package io.openex.player.injects.email.model;

import io.openex.player.model.ContentBase;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class EmailContent implements ContentBase {

    private static final String HEADER_DIV = "<div style=\"text-align: center; margin-bottom: 10px;\">";
    private static final String FOOTER_DIV = "<div style=\"text-align: center; margin-top: 10px;\">";
    private static final String START_DIV = "<div>";
    private static final String END_DIV = "</div>";

    private String subject;
    private String body;
    private List<EmailInjectAttachment> attachments = new ArrayList<>();

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
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

    public List<EmailInjectAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<EmailInjectAttachment> attachments) {
        this.attachments = attachments;
    }
}
