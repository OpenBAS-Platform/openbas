package io.openbas.executors.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.AssetAgentJobRepository;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Log
@Service
public class OpenBASExecutorContextService {

    private AssetAgentJobRepository assetAgentJobRepository;

    @Autowired
    public void setAssetAgentJobRepository(AssetAgentJobRepository assetAgentJobRepository) {
        this.assetAgentJobRepository = assetAgentJobRepository;
    }

    private String computeCommand(@NotNull final Inject inject, Endpoint.PLATFORM_TYPE platform, Endpoint.PLATFORM_ARCH arch) {
        Injector injector = inject.getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(() -> new UnsupportedOperationException("Inject does not have a contract"));

        switch (platform) {
            case Windows -> {
                return injector.getExecutorCommands().get(Endpoint.PLATFORM_TYPE.Windows.name() + "." + arch.name())
                        .replace("#{inject}", inject.getId());
            }
            case Linux -> {
                return injector.getExecutorCommands().get(Endpoint.PLATFORM_TYPE.Linux.name() + "." + arch.name())
                        .replace("#{inject}", inject.getId());
            }
            case MacOS -> {
                return injector.getExecutorCommands().get(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + arch.name())
                        .replace("#{inject}", inject.getId());
            }
            default -> throw new RuntimeException("Unsupported platform: " + platform);
        }
    }

    public void launchExecutorSubprocess(@NotNull final Inject inject, @NotNull final Asset asset) {
        Endpoint.PLATFORM_TYPE platform = Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform() : null;
        Endpoint.PLATFORM_ARCH arch = Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getArch() : null;
        if (null == platform) {
            throw new RuntimeException("Unsupported null platform");
        }
        AssetAgentJob assetAgentJob = new AssetAgentJob();
        assetAgentJob.setCommand(computeCommand(inject, platform, arch));
        assetAgentJob.setAsset(asset);
        assetAgentJob.setInject(inject);
        assetAgentJob.setElevationRequired(this.isElevationRequired(inject));
        assetAgentJobRepository.save(assetAgentJob);
    }

    public void launchExecutorClear(@NotNull final Injector injector, @NotNull final Asset asset) {
        // TODO
    }

    private boolean isElevationRequired(final Inject inject) {
        // Fix me add also for caldera
        return inject.getInjectorContract().map(injectorContract -> injectorContract.getPayload().isElevationRequired()).orElse(false).booleanValue();
    }
}
