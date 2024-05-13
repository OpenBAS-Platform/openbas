package io.openbas.executors.tanium.service;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Injector;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.integrations.InjectorService;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Log
@Service
public class TaniumExecutorContextService {

    private InjectorService injectorService;

    private TaniumExecutorClient taniumExecutorClient;

    @Autowired
    public void setInjectorService(InjectorService injectorService) {
        this.injectorService = injectorService;
    }

    @Autowired
    public void setTaniumExecutorClient(TaniumExecutorClient taniumExecutorClient) {
        this.taniumExecutorClient = taniumExecutorClient;
    }

    public void launchExecutorSubprocess(@NotNull final Injector injector, @NotNull final Asset asset) {

    }

    public void launchExecutorClear(@NotNull final Injector injector, @NotNull final Asset asset) {

    }
}
