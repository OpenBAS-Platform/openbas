package io.openbas.contract.fields;

import io.openbas.contract.ContractCardinality;
import io.openbas.contract.ContractType;

public class ContractAttachment extends ContractCardinalityElement {

    public ContractAttachment(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractAttachment attachmentField(String key, String label, ContractCardinality cardinality) {
        return new ContractAttachment(key, label, cardinality);
    }

    @Override
    public ContractType getType() {
        return ContractType.Attachment;
    }
}
