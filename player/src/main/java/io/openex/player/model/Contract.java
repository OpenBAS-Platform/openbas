package io.openex.player.model;

import io.openex.player.contract.ContractDef;
import io.openex.player.contract.RestContract;

public abstract class Contract {

    public abstract String id();

    public abstract ContractDef definition();

    public abstract Class<? extends InjectData> dataClass();

    public RestContract toRest() {
        return new RestContract(id(), definition().getFields());
    }
}
