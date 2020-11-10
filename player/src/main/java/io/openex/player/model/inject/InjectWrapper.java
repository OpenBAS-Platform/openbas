package io.openex.player.model.inject;

public class InjectWrapper {
    private InjectContext context;
    private InjectBase inject;

    public InjectContext getContext() {
        return context;
    }

    public void setContext(InjectContext context) {
        this.context = context;
    }

    public InjectBase getInject() {
        return inject;
    }

    public void setInject(InjectBase inject) {
        this.inject = inject;
    }
}
