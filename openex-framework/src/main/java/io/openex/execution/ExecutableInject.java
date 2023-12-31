package io.openex.execution;

import io.openex.contract.Contract;
import io.openex.database.model.Team;
import io.openex.database.model.Inject;
import io.openex.database.model.Injection;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

public class ExecutableInject {
    private final Inject inject;
    private final Contract contract;
    private final Injection source;
    private final List<ExecutionContext> users;
    private final List<Team> teams;
    private final boolean runtime;
    private final boolean direct;
    private final int teamSize;
    private final int documentSize;
    private List<MultipartFile> directAttachments = new ArrayList<>();

    public ExecutableInject(boolean runtime, boolean direct, Injection source, Inject inject, Contract contract, List<Team> teams, List<ExecutionContext> users) {
        this.runtime = runtime;
        this.direct = direct;
        this.source = source;
        this.inject = inject;
        this.contract = contract;
        this.users = users;
        this.teams = teams;
        this.teamSize = teams.size();
        this.documentSize = inject.getDocuments().size();
    }

    public ExecutableInject(boolean runtime, boolean direct, Inject inject, Contract contract, List<Team> teams, List<ExecutionContext> users) {
        this(runtime, direct, inject, inject, contract, teams, users);
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

    public List<Team> getTeams() {
        return teams;
    }

    public List<ExecutionContext> getUsers() {
        return users;
    }

    public boolean isDirect() {
        return direct;
    }

    public List<MultipartFile> getDirectAttachments() {
        return directAttachments;
    }

    public void setDirectAttachments(List<MultipartFile> directAttachments) {
        this.directAttachments = directAttachments;
    }

    public void addDirectAttachment(MultipartFile file) {
        this.directAttachments.add(file);
    }

    public boolean isRuntime() {
        return runtime;
    }

    public int getDocumentSize() {
        return documentSize;
    }

    public int getTeamSize() {
        return teamSize;
    }
}
