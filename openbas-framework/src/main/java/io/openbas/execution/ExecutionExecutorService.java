package io.openbas.execution;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Executor;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Injector;
import io.openbas.executors.caldera.service.CalderaExecutorContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Level;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Service
@Log
public class ExecutionExecutorService {
    private AssetGroupService assetGroupService;

    private CalderaExecutorContextService calderaExecutorContextService;

    @Autowired
    public void setAssetGroupService(AssetGroupService assetGroupService) {
        this.assetGroupService = assetGroupService;
    }

    @Autowired
    public void setCalderaExecutorContextService(CalderaExecutorContextService calderaExecutorContextService) {
        this.calderaExecutorContextService = calderaExecutorContextService;
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
        return executableInject;
    }

    private void launchExecutorContextForAsset(Injector injector, Asset asset) {
        Executor executor = asset.getExecutor();
        if( executor == null ) {
            log.log(Level.SEVERE, "Cannot find the executor for the asset " + asset.getName());
        } else {
            switch (executor.getType()) {
                case "openbas_caldera" -> this.calderaExecutorContextService.launchExecutorSubprocess(injector, asset);
                case "openbas_tanium" -> log.log(Level.SEVERE, "Unsupported executor " + executor.getType());
                default -> log.log(Level.SEVERE, "Unsupported executor " + executor.getType());
            }
        }
    }
}
