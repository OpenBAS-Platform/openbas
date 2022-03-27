package io.openex.contract;

import java.util.List;

public interface BaseContract {

    boolean isExpose();

    String getType();

    List<ContractInstance> generateContracts() throws Exception;
}
