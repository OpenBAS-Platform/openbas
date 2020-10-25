package io.openex.player.injects.email;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.player.model.Execution;
import io.openex.player.model.InjectData;
import io.openex.player.model.User;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EmailInject extends InjectData {
    private String subject;
    private String body;
    private String replyTo;
    private String contentHeader;
    private String contentFooter;
    private List<User> users;
    private List<EmailAttachment> attachments;

    @Override
    public void process(Execution execution) {
        users.stream().parallel().forEach(user -> {

        });

        execution.addMessage("EXECUTING EMAIL DATA" + subject);
        System.out.println("EXECUTING EMAIL DATA" + subject);
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public List<EmailAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<EmailAttachment> attachments) {
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

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    @JsonProperty("replyto")
    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }
}
