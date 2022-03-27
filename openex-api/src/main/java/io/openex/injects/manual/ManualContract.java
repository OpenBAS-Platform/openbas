package io.openex.injects.manual;

import io.openex.contract.BaseContract;
import io.openex.contract.ContractInstance;
import io.openex.contract.fields.ContractElement;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractTextArea.textareaField;

@Component
public class ManualContract implements BaseContract {

    public static final String MANUAL_DEFAULT = "d02e9132-b9d0-4daa-b3b1-4b9871f8472c";
    public static final String TYPE = "openex_manual";

    @Override
    public boolean isExpose() {
        return true;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public List<ContractInstance> generateContracts() throws Exception {
        List<ContractElement> instance = contractBuilder()
                .mandatory(textareaField("content", "Content"))
                .build();
        return List.of(new ContractInstance(TYPE, isExpose(), MANUAL_DEFAULT, "Manual (reminder)", instance));
    }
}
