package io.openbas.contract;

import java.util.List;

public abstract class Contractor {

    protected abstract boolean isExpose();

    public abstract String getType();

    public abstract ContractConfig getConfig();

    public abstract List<Contract> contracts() throws Exception;
}
