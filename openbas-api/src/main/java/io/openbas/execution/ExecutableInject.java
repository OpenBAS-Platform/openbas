package io.openbas.execution;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.openbas.database.model.*;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Getter
public class ExecutableInject {

    private final Injection injection;
    private final int teamSize;
    private final boolean direct;
    private final boolean runtime;
    private final int documentSize;
    private final List<Team> teams;
    private final Exercise exercise;
    private final List<Asset> assets;
    private final List<AssetGroup> assetGroups;
    private final List<ExecutionContext> users;

    @JsonIgnore
    private final List<MultipartFile> directAttachments = new ArrayList<>();

    public ExecutableInject(boolean runtime, boolean direct, Injection injection,
                            List<Team> teams, List<Asset> assets, List<AssetGroup> assetGroups, List<ExecutionContext> users) {
        this.injection = injection;
        this.exercise = injection.getExercise();
        this.runtime = runtime;
        this.direct = direct;
        this.users = users;
        this.teams = teams;
        this.assets = assets;
        this.assetGroups = assetGroups;
        this.teamSize = teams.size();
        this.documentSize = injection.getInject().getDocuments().size();
    }

    public ExecutableInject(boolean runtime, boolean direct, Injection injection, List<ExecutionContext> users) {
        this(runtime, direct, injection, List.of(), List.of(), List.of(), users);
    }

    public void addDirectAttachment(MultipartFile file) {
        this.directAttachments.add(file);
    }

}
