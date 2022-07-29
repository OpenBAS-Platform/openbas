package io.openex.contract.fields;

import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractType;

public class ContractTuple extends ContractCardinalityElement {
    private String attachmentKey;

    public ContractTuple(String key, String label, ContractCardinality cardinality) {
        super(key, label, cardinality);
    }

    public static ContractTuple tupleField(String key, String label) {
        return new ContractTuple(key, label, ContractCardinality.Multiple);
    }

    public static ContractTuple tupleField(String key, String label, ContractAttachment attachmentContract) {
        ContractTuple contractTuple = new ContractTuple(key, label, ContractCardinality.Multiple);
        contractTuple.setAttachmentKey(attachmentContract.getKey());
        return contractTuple;
    }

    @Override
    public ContractType getType() {
        return ContractType.Tuple;
    }

    public String getAttachmentKey() {
        return attachmentKey;
    }

    public void setAttachmentKey(String attachmentKey) {
        this.attachmentKey = attachmentKey;
    }

    public Boolean isContractAttachment() {
        return attachmentKey != null;
    }
}
