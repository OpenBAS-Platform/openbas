package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.model.ContentBase;
import org.springframework.util.StringUtils;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OvhSmsContent implements ContentBase {

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

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
