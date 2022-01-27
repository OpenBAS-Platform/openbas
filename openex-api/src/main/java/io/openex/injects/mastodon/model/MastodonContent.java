package io.openex.injects.mastodon.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.injects.base.AttachmentContent;
import io.openex.injects.base.InjectAttachment;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MastodonContent implements AttachmentContent {

    @JsonProperty("token")
    private String token;

    @JsonProperty("status")
    private String status;

    @JsonProperty("attachments")
    private List<InjectAttachment> attachments = new ArrayList<>();

    public String buildStatus(String footer, String header) {
        StringBuilder data = new StringBuilder();
        if (StringUtils.hasLength(header)) {
            data.append(header).append("\r\n");
        }
        data.append(status);
        if (StringUtils.hasLength(footer)) {
            data.append("\r\n").append(footer);
        }
        return data.toString();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
        MastodonContent that = (MastodonContent) o;
        return status == that.status && Objects.equals(attachments, that.attachments);
    }

    @Override
    public int hashCode() {
        return Objects.hash(status, attachments);
    }
}
