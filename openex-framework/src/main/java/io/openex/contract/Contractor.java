package io.openex.contract;

import java.util.List;

public abstract class Contractor {

    protected abstract boolean isExpose();

    protected abstract String getType();

    public abstract ContractConfig getConfig();

    public abstract List<Contract> contracts() throws Exception;
}
