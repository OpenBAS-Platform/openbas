package io.openex.player.injects.ovh_sms;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.player.model.inject.InjectBase;
import io.openex.player.utils.Executor;
import org.springframework.util.StringUtils;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OvhSmsInject extends InjectBase {

    private String message;

    @Override
    public Class<? extends Executor<OvhSmsInject>> executor() {
        return OvhSmsExecutor.class;
    }

    public String getMessage() {
        StringBuilder data = new StringBuilder();
        String header = getContentHeader();
        if (!StringUtils.isEmpty(header)) {
            data.append(header).append("\r\n");
        }
        data.append(message);
        String footer = getContentFooter();
        if (!StringUtils.isEmpty(footer)) {
            data.append("\r\n").append(footer);
        }
        return data.toString();
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
