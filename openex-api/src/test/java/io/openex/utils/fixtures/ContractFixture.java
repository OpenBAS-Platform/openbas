package io.openex.utils.fixtures;

import io.openex.contract.ContractSearchInput;

public class ContractFixture {

    public static ContractSearchInput.ContractSearchInputBuilder getDefault() {
        return ContractSearchInput.builder().exposedContractsOnly(true);
    }

}
