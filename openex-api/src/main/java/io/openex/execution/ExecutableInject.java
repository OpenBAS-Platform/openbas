package io.openex.execution;

import io.openex.database.model.Injection;

import java.util.List;

public class ExecutableInject<T> {
    private Injection<T> inject;
    private List<ExecutionContext> users;

    public ExecutableInject(Injection<T> inject, List<ExecutionContext> users) {
        this.inject = inject;
        this.users = users;
    }

    public Injection<T> getInject() {
        return inject;
    }

    public void setInject(Injection<T> inject) {
        this.inject = inject;
    }

    public List<ExecutionContext> getUsers() {
        return users;
    }

    public void setUsers(List<ExecutionContext> users) {
        this.users = users;
    }
}
