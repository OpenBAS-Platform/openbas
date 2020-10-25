package io.openex.player;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openex.player.contract.RestContract;
import io.openex.player.model.Contract;
import io.openex.player.model.Execution;
import io.openex.player.model.InjectContext;
import io.openex.player.model.InjectData;
import io.openex.player.utils.Discovery;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class RestHandler {

    @Resource
    private Discovery discovery;
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/contracts")
    public List<RestContract> getContracts() {
        List<Contract> contracts = discovery.contracts();
        return contracts.stream()
                .filter(contract -> contract.definition() != null)
                .map(Contract::toRest).collect(Collectors.toList());
    }

    @PostMapping("/worker/{id}")
    public Execution execute(@PathVariable String id, String jsonRequest) throws Exception {
        Map<String, Contract> contractsById = discovery.contractsById();
        Contract contract = contractsById.get(id);
        InjectContext injectContext = mapper.readValue(jsonRequest, InjectContext.class);
        InjectData injectData = mapper.readValue(injectContext.getData(), contract.dataClass());
        return injectData.execute();
    }
}
