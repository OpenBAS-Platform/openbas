package io.openex.player.utils;

import io.openex.player.model.Contract;
import org.reflections.Reflections;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class Discovery {

    private List<Contract> contracts;

    public Discovery() {
        Reflections reflections = new Reflections("io.openex.player.injects");
        Set<Class<? extends Contract>> contractList = reflections.getSubTypesOf(Contract.class);
        contracts = contractList.stream().map(aClass -> {
            try {
                return (Contract) aClass.getConstructors()[0].newInstance();
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public List<Contract> contracts() {
        return contracts;
    }

    public Map<String, Contract> contractsById() {
        return contracts.stream().collect(Collectors.toMap(Contract::id, contract -> contract));
    }
}
