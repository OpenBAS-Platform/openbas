package io.openex.player.injects.sms.ovh;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.openex.player.model.Execution;
import io.openex.player.model.InjectData;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OvhSmsInject extends InjectData {
    private String message;

    @Override
    public void process(Execution execution) {
        execution.addMessage("EXECUTING OVH SMS DATA" + message);
        System.out.println("EXECUTING OVH SMS DATA" + message);
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
