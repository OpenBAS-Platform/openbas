package io.openex.execution;

import io.openex.database.model.Inject;

import java.util.List;

public class ExecutableInject<T extends Inject> {
    private T inject;
    private List<ExecutionContext> users;

    public ExecutableInject(T inject, List<ExecutionContext> users) {
        this.inject = inject;
        this.users = users;
    }

    public T getInject() {
        return inject;
    }

    public void setInject(T inject) {
        this.inject = inject;
    }

    public List<ExecutionContext> getUsers() {
        return users;
    }

    public void setUsers(List<ExecutionContext> users) {
        this.users = users;
    }
}
