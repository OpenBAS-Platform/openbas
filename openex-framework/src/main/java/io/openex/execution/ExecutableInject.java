package io.openex.execution;

import io.openex.contract.Contract;
import io.openex.database.model.Audience;
import io.openex.database.model.Inject;
import io.openex.database.model.Injection;

import java.util.List;

public class ExecutableInject {
    private final Inject inject;
    private final Contract contract;
    private final Injection source;
    private final List<ExecutionContext> users;
    private final List<Audience> audiences;

    public ExecutableInject(Inject inject, Contract contract, List<Audience> audiences, List<ExecutionContext> users) {
        this.inject = inject;
        this.contract = contract;
        this.source = inject;
        this.users = users;
        this.audiences = audiences;
    }

    public ExecutableInject(Injection source, Inject inject, Contract contract, List<Audience> audiences, List<ExecutionContext> users) {
        this.inject = inject;
        this.contract = contract;
        this.source = source;
        this.users = users;
        this.audiences = audiences;
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

    public List<Audience> getAudiences() {
        return audiences;
    }

    public List<ExecutionContext> getUsers() {
        return users;
    }
}
