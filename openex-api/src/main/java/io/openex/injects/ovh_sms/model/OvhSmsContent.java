package io.openex.injects.ovh_sms.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.util.StringUtils;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OvhSmsContent {

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
}
