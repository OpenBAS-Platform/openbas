package io.openbas.executors.tanium.service;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Objects;

@Log
@Service
public class TaniumExecutorContextService {
    private TaniumExecutorConfig taniumExecutorConfig;

    private TaniumExecutorClient taniumExecutorClient;

    @Autowired
    public void setTaniumExecutorConfig(TaniumExecutorConfig taniumExecutorConfig) {
        this.taniumExecutorConfig = taniumExecutorConfig;
    }

    @Autowired
    public void setTaniumExecutorClient(TaniumExecutorClient taniumExecutorClient) {
        this.taniumExecutorClient = taniumExecutorClient;
    }

    public void launchExecutorSubprocess(@NotNull final Inject inject, @NotNull final Asset asset) {
        Injector injector = inject.getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(() -> new UnsupportedOperationException("Inject does not have a contract"));

        Endpoint.PLATFORM_TYPE platform = Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getPlatform(): null;
        Endpoint.PLATFORM_ARCH arch = Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)).getArch(): null;
        if( platform == null || arch == null ) {
            throw new RuntimeException("Unsupported platform: " + platform + " (arch:" + arch + ")");
        }
        switch (platform ) {
            case Endpoint.PLATFORM_TYPE.Windows -> {
                String command = injector.getExecutorCommands().get(Endpoint.PLATFORM_TYPE.Windows.name() + "." + arch.name())
                        .replace("\"#{location}\"", "$PWD.Path")
                        .replace("#{inject}", inject.getId());
                this.taniumExecutorClient.executeAction(asset.getExternalReference(), this.taniumExecutorConfig.getWindowsPackageId(), Base64.getEncoder().encodeToString(command.getBytes()));
            }
            case Endpoint.PLATFORM_TYPE.Linux -> {
                String command = injector.getExecutorCommands().get(Endpoint.PLATFORM_TYPE.Linux.name() + "." + arch.name())
                        .replace("\"#{location}\"", "$(pwd)")
                        .replace("#{inject}", inject.getId());
                this.taniumExecutorClient.executeAction(asset.getExternalReference(), this.taniumExecutorConfig.getUnixPackageId(), Base64.getEncoder().encodeToString(command.getBytes()));
            }
            case Endpoint.PLATFORM_TYPE.MacOS -> {
                String command = injector.getExecutorCommands().get(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + arch.name())
                        .replace("\"#{location}\"", "$(pwd)")
                        .replace("#{inject}", inject.getId());
                this.taniumExecutorClient.executeAction(asset.getExternalReference(), this.taniumExecutorConfig.getUnixPackageId(), Base64.getEncoder().encodeToString(command.getBytes()));
            }
            default -> throw new RuntimeException("Unsupported platform: " + platform);
        };
    }

    public void launchExecutorClear(@NotNull final Injector injector, @NotNull final Asset asset) {

    }
}
