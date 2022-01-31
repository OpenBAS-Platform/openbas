package io.openex.contract;

import java.util.List;

public interface Contract {

    boolean isExpose();

    String getType();

    List<ContractField> getFields();
}
