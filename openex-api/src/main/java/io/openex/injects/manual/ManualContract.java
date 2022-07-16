package io.openex.injects.manual;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import io.openex.helper.SupportedLanguage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static io.openex.contract.Contract.manualContract;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractTextArea.textareaField;
import static io.openex.helper.SupportedLanguage.en;
import static io.openex.helper.SupportedLanguage.fr;

@Component
public class ManualContract extends Contractor {
    public static final String TYPE = "openex_manual";

    public static final String MANUAL_DEFAULT = "d02e9132-b9d0-4daa-b3b1-4b9871f8472c";

    @Override
    public boolean isExpose() {
        return true;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public ContractConfig getConfig() {
        Map<SupportedLanguage, String> label = Map.of(en, "Manual", fr, "Manuel");
        return new ContractConfig(TYPE, label, "#009688", "/img/manual.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        List<ContractElement> instance = contractBuilder()
                .mandatory(textareaField("content", "Content")).build();
        return List.of(manualContract(contractConfig, MANUAL_DEFAULT,
                Map.of(en, "Manual", fr, "Manuel"), instance));
    }
}
