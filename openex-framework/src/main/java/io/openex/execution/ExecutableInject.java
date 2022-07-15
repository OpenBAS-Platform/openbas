package io.openex.execution;

import io.openex.contract.Contract;
import io.openex.database.model.Inject;
import io.openex.database.model.Injection;

import java.util.List;

public class ExecutableInject {
    private boolean direct = false;
    private final Inject inject;
    private final Contract contract;
    private final Injection source;
    private final List<ExecutionContext> users;

    public ExecutableInject(Inject inject, Contract contract, List<ExecutionContext> users) {
        this.inject = inject;
        this.contract = contract;
        this.source = inject;
        this.users = users;
    }

    public ExecutableInject(Injection source, Inject inject, Contract contract, List<ExecutionContext> users) {
        this.inject = inject;
        this.contract = contract;
        this.source = source;
        this.users = users;
    }

    public boolean isDirect() {
        return direct;
    }

    public void setDirect(boolean direct) {
        this.direct = direct;
    }

    public Inject getInject() {
        return inject;
    }

    public Contract getContract() {
        return contract;
    }

    public Injection getSource() {
        return source;
    }

    public List<ExecutionContext> getUsers() {
        return users;
    }
}
