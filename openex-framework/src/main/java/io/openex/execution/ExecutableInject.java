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
    private final boolean testingInject;

    public ExecutableInject(boolean testing, Inject inject, Contract contract, List<Audience> audiences, List<ExecutionContext> users) {
        this.testingInject = testing;
        this.source = inject;
        this.inject = inject;
        this.contract = contract;
        this.users = users;
        this.audiences = audiences;
    }

    public ExecutableInject(boolean testing, Injection source, Inject inject, Contract contract, List<Audience> audiences, List<ExecutionContext> users) {
        this.testingInject = testing;
        this.source = source;
        this.inject = inject;
        this.contract = contract;
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

    public boolean isTestingInject() {
        return testingInject;
    }
}
