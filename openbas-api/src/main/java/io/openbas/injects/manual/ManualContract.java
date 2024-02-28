package io.openbas.injects.manual;

import io.openbas.contract.Contract;
import io.openbas.contract.ContractConfig;
import io.openbas.contract.Contractor;
import io.openbas.contract.fields.ContractElement;
import io.openbas.helper.SupportedLanguage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static io.openbas.contract.Contract.manualContract;
import static io.openbas.contract.ContractDef.contractBuilder;
import static io.openbas.contract.fields.ContractTextArea.textareaField;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;

@Component
public class ManualContract extends Contractor {
    public static final String TYPE = "openbas_manual";

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
        return new ContractConfig(TYPE, label, "#009688", "#009688", "/img/manual.png", isExpose());
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
