package io.openex.contract;

import io.openex.database.model.InjectTypes;

public abstract class Contract {

    public abstract boolean expose();

    public abstract String id();

    public abstract ContractDef definition();

    public InjectTypes toRest() {
        return new InjectTypes(id(), definition().getFields());
    }
}
