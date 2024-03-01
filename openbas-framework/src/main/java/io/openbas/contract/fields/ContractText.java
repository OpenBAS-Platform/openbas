package io.openbas.contract.fields;

import io.openbas.contract.ContractType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ContractText extends ContractElement {

    private String defaultValue = "";

    public ContractText(String key, String label) {
        super(key, label);
    }

    public static ContractText textField(String key, String label) {
        return new ContractText(key, label);
    }

    public static ContractText textField(String key, String label, String defaultValue) {
        ContractText contractText = new ContractText(key, label);
        contractText.setDefaultValue(defaultValue);
        return contractText;
    }

    public static ContractText textField(String key, String label, String defaultValue, List<ContractElement> linkedFields) {
        ContractText contractText = new ContractText(key, label);
        contractText.setDefaultValue(defaultValue);
        contractText.setLinkedFields(linkedFields);
        return contractText;
    }

    @Override
    public ContractType getType() {
        return ContractType.Text;
    }

}
