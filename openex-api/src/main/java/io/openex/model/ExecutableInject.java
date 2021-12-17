package io.openex.model;

import io.openex.database.model.Injection;

import java.util.List;

public class ExecutableInject<T> {
    private Injection<T> inject;
    private List<UserInjectContext> users;

    public ExecutableInject(Injection<T> inject, List<UserInjectContext> users) {
        this.inject = inject;
        this.users = users;
    }

    public Injection<T> getInject() {
        return inject;
    }

    public void setInject(Injection<T> inject) {
        this.inject = inject;
    }

    public List<UserInjectContext> getUsers() {
        return users;
    }

    public void setUsers(List<UserInjectContext> users) {
        this.users = users;
    }
}
