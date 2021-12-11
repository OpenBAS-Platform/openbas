package io.openex.player.model.execution;

import io.openex.player.model.database.Injection;
import io.openex.player.model.ContentBase;

import java.util.List;

public class ExecutableInject<T extends ContentBase> {
    private Injection<T> inject;
    private List<UserInjectContext> users;
    private boolean dryRun;

    private ExecutableInject(boolean dryRun, Injection<T> inject, List<UserInjectContext> users) {
        this.dryRun = dryRun;
        this.inject = inject;
        this.users = users;
    }

    public static <T extends ContentBase> ExecutableInject<T > prodRun(Injection<T> inject, List<UserInjectContext> users) {
        return new ExecutableInject<>(false, inject, users);
    }

    public static <T extends ContentBase> ExecutableInject<T > dryRun(Injection<T> inject, List<UserInjectContext> users) {
        return new ExecutableInject<>(true, inject, users);
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

    public boolean isDryRun() {
        return dryRun;
    }

    public void setDryRun(boolean dryRun) {
        this.dryRun = dryRun;
    }
}
