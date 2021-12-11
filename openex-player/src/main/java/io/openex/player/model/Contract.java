package io.openex.player.model;

import io.openex.player.contract.ContractDef;
import io.openex.player.model.database.InjectTypes;

public abstract class Contract {

    public abstract boolean expose();

    public abstract String id();

    public abstract ContractDef definition();

    public abstract Class<? extends ContentBase> dataClass();

    public InjectTypes toRest() {
        return new InjectTypes(id(), definition().getFields());
    }
}
