package io.openbas.execution;

import io.openbas.asset.AssetGroupService;
import io.openbas.asset.EndpointService;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Executor;
import io.openbas.database.model.Injector;
import io.openbas.database.model.*;
import io.openbas.database.repository.VariableRepository;
import io.openbas.executors.caldera.service.CalderaExecutorContextService;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.logging.Level;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Service
@Log
public class ExecutionExecutorService {
    private final int RETRY_NUMBER = 20;

    private AssetGroupService assetGroupService;

    private CalderaExecutorContextService calderaExecutorContextService;

    private EndpointService endpointService;

    @Autowired
    public void setAssetGroupService(AssetGroupService assetGroupService) {
        this.assetGroupService = assetGroupService;
    }

    @Autowired
    public void setCalderaExecutorContextService(CalderaExecutorContextService calderaExecutorContextService) {
        this.calderaExecutorContextService = calderaExecutorContextService;
    }

    @Autowired
    public void setEndpointService(EndpointService endpointService) {
        this.endpointService = endpointService;
    }

    public ExecutableInject launchExecutorContext(ExecutableInject executableInject, Inject inject) throws InterruptedException {
        // First, get the assets of this injects
        List<Asset> assets = Stream.concat(
                inject.getAssets().stream(),
                inject.getAssetGroups().stream().flatMap(assetGroup -> this.assetGroupService.assetsFromAssetGroup(assetGroup.getId()).stream())
        ).toList();
        assets.forEach(asset -> {
            launchExecutorContextForAsset(inject.getInjectorContract().getInjector(), asset);
        });

        Thread.sleep(3000);

        // Resolve all new registered assets
        Map<String, Asset> subProcessorAssets = new HashMap<>();
        assets.forEach(asset -> {
            Asset subProcessorAsset = null;
            try {
                subProcessorAsset = this.findExecutor(asset);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            if( subProcessorAsset != null ) {
                subProcessorAssets.put(asset.getId(), subProcessorAsset);
            }
        });
        executableInject.setSubProcessorAssets(subProcessorAssets);
        return executableInject;
    }

    private void launchExecutorContextForAsset(Injector injector, Asset asset) {
        Executor executor = asset.getExecutor();
        if( executor == null ) {
            log.log(Level.SEVERE, "Cannot find the executor for the asset " + asset.getName());
        } else {
            switch (executor.getType()) {
                case "openbas_caldera":
                    this.calderaExecutorContextService.launchExecutorSubprocess(injector, asset);
                    break;
                case "openbas_tanium":
                    log.log(Level.SEVERE, "Unsupported executor " + executor.getType());
                    break;
                default:
                    log.log(Level.SEVERE, "Unsupported executor " + executor.getType());
            }
        }
    }

    private Asset findExecutor(Asset asset) throws InterruptedException {
        int count = 0;
        Asset subProcessorAsset = null;
        while (subProcessorAsset == null) {
            count++;
            Endpoint assetEndpoint = Objects.equals(asset.getType(), "Endpoint") ? ((Endpoint) Hibernate.unproxy(asset)) : null;
            if( assetEndpoint == null ) {
                break;
            }
            List<Endpoint> existingEndpoints = this.endpointService.findExecutorsByHostname(assetEndpoint.getHostname()).stream().filter(endpoint1 -> endpoint1.getActive() && Arrays.stream(endpoint1.getIps()).anyMatch(s -> Arrays.stream(assetEndpoint.getIps()).toList().contains(s))).toList();
            if (!existingEndpoints.isEmpty()) {
                subProcessorAsset = existingEndpoints.getFirst();
            }
            Thread.sleep(5000);
            if (count >= RETRY_NUMBER) {
                break;
            }
        }
        return subProcessorAsset;
    }
}
