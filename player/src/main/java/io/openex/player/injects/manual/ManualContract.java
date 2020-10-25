package io.openex.player.injects.manual;

import io.openex.player.contract.ContractDef;
import io.openex.player.model.Contract;
import io.openex.player.model.InjectData;

@SuppressWarnings("unused")
public class ManualContract extends Contract {

    @Override
    public String id() {
        return "openex_manual";
    }

    @Override
    public ContractDef definition() { return null; }

    @Override
    public Class<? extends InjectData> dataClass() {
        return ManualInject.class;
    }
}
