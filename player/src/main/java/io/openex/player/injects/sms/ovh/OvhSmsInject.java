package io.openex.player.injects.sms.ovh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.player.model.inject.InjectBase;
import io.openex.player.utils.Executor;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OvhSmsInject extends InjectBase {
    private String message;

    @Override
    public Class<? extends Executor<OvhSmsInject>> executor() {
        return OvhSmsExecutor.class;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
