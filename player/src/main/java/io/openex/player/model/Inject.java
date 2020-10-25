package io.openex.player.model;

public class Inject {
    private InjectContext context;
    private InjectData inject;

    public InjectContext getContext() {
        return context;
    }

    public void setContext(InjectContext context) {
        this.context = context;
    }

    public InjectData getInject() {
        return inject;
    }

    public void setInject(InjectData inject) {
        this.inject = inject;
    }
}
