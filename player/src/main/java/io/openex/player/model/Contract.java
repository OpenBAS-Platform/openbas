package io.openex.player.model;

import io.openex.player.contract.ContractDef;
import io.openex.player.contract.RestContract;
import io.openex.player.model.inject.InjectBase;

public abstract class Contract {

    public abstract boolean expose();

    public abstract String id();

    public abstract ContractDef definition();

    public abstract Class<? extends InjectBase> dataClass();

    public RestContract toRest() {
        return new RestContract(id(), definition().getFields());
    }
}
