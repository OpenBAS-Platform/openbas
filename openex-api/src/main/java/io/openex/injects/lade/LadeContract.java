package io.openex.injects.lade;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.contract.BaseContract;
import io.openex.contract.ContractInstance;
import io.openex.injects.lade.config.LadeConfig;
import io.openex.injects.lade.service.LadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.List;

@Component
public class LadeContract implements BaseContract {

    @Resource
    protected ObjectMapper mapper;

    public static final String TYPE = "openex_lade";

    private LadeConfig config;

    private LadeService ladeService;

    @Autowired
    public void setLadeService(LadeService ladeService) {
        this.ladeService = ladeService;
    }

    @Autowired
    public void setConfig(LadeConfig config) {
        this.config = config;
    }

    @Override
    public boolean isExpose() {
        return config.getEnable();
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public List<ContractInstance> generateContracts() throws Exception {
        if (isExpose()) {
            return ladeService.buildContracts(this);
        }
        return List.of();
    }
}
