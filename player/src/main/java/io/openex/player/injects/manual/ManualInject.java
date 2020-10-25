package io.openex.player.injects.manual;

import io.openex.player.model.inject.InjectBase;
import io.openex.player.utils.Executor;

public class ManualInject extends InjectBase {
    private String content;

    @Override
    public Class<? extends Executor<ManualInject>> executor() {
        return ManualExecutor.class;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
