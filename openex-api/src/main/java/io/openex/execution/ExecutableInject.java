package io.openex.execution;

import io.openex.database.model.Inject;
import io.openex.database.model.Injection;

import java.util.List;

public class ExecutableInject<T extends Inject> {
    private final T inject;
    private final Injection source;
    private final List<ExecutionContext> users;

    public ExecutableInject(T inject, List<ExecutionContext> users) {
        this.inject = inject;
        this.source = inject;
        this.users = users;
    }

    public ExecutableInject(Injection source, T inject, List<ExecutionContext> users) {
        this.inject = inject;
        this.source = source;
        this.users = users;
    }

    public T getInject() {
        return inject;
    }

    public Injection getSource() {
        return source;
    }

    public List<ExecutionContext> getUsers() {
        return users;
    }
}
