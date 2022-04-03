package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

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
