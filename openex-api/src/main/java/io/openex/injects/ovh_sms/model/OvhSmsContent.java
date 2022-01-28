package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.database.model.InjectContent;
import org.springframework.util.StringUtils;

import java.util.Objects;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OvhSmsContent extends InjectContent {

    private String message;

    public String buildMessage(String footer, String header) {
        StringBuilder data = new StringBuilder();
        if (StringUtils.hasLength(header)) {
            data.append(header).append("\r\n");
        }
        data.append(message);
        if (StringUtils.hasLength(footer)) {
            data.append("\r\n").append(footer);
        }
        return data.toString();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OvhSmsContent that = (OvhSmsContent) o;
        return Objects.equals(message, that.message);
    }

    @Override
    public int hashCode() {
        return Objects.hash(message);
    }
}
