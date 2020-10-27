package io.openex.player.injects.manual;

import io.openex.player.contract.ContractDef;
import io.openex.player.model.Contract;
import io.openex.player.model.inject.InjectBase;
import org.springframework.stereotype.Component;

@Component
public class ManualContract extends Contract {

    @Override
    public boolean expose() { return false; }

    @Override
    public String id() {
        return "openex_manual";
    }

    @Override
    public ContractDef definition() { return null; }

    @Override
    public Class<? extends InjectBase> dataClass() {
        return ManualInject.class;
    }
}
