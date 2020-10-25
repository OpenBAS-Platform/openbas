package io.openex.player.injects.manual;

import io.openex.player.model.Execution;
import io.openex.player.model.InjectData;

public class ManualInject extends InjectData {
    private String content;

    @Override
    public void process(Execution execution) {
        execution.addMessage("EXECUTING MANUAL DATA" + content);
        System.out.println("EXECUTING MANUAL DATA" + content);
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
