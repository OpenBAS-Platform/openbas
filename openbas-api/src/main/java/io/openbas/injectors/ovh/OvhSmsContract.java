package io.openbas.injectors.ovh;

import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.ContractConfig;
import io.openbas.injector_contract.Contractor;
import io.openbas.injector_contract.ContractorIcon;
import io.openbas.injector_contract.fields.ContractElement;
import io.openbas.injector_contract.fields.ContractExpectations;
import io.openbas.database.model.Endpoint;
import io.openbas.injectors.ovh.config.OvhSmsConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static io.openbas.injector_contract.Contract.executableContract;
import static io.openbas.injector_contract.ContractCardinality.Multiple;
import static io.openbas.injector_contract.ContractDef.contractBuilder;
import static io.openbas.injector_contract.fields.ContractExpectations.expectationsField;
import static io.openbas.injector_contract.fields.ContractTeam.teamField;
import static io.openbas.injector_contract.fields.ContractTextArea.textareaField;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;

@Component
public class OvhSmsContract extends Contractor {

    public static final String TYPE = "openbas_ovh_sms";

    public static final String OVH_DEFAULT = "e9e902bc-b03d-4223-89e1-fca093ac79dd";

    private OvhSmsConfig config;

    @Autowired
    public void setConfig(OvhSmsConfig config) {
        this.config = config;
    }

    @Override
    public boolean isExpose() {
        return Optional.ofNullable(config.getEnable()).orElse(false);
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public ContractConfig getConfig() {
        return new ContractConfig(TYPE, Map.of(en, "SMS (OVH)"), "#9c27b0", "#9c27b0", "/img/sms.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        ContractExpectations expectationsField = expectationsField(
                "expectations", "Expectations"
        );
        List<ContractElement> instance = contractBuilder()
                .mandatory(teamField("teams", "Teams", Multiple))
                .mandatory(textareaField("message", "Message"))
                .optional(expectationsField)
                .build();
        return List.of(executableContract(contractConfig, OVH_DEFAULT,
                Map.of(en, "Send a SMS", fr, "Envoyer un SMS"), instance, List.of(Endpoint.PLATFORM_TYPE.Service), false));
    }
    @Override
    public ContractorIcon getIcon() {
        InputStream iconStream = getClass().getResourceAsStream("/img/icon-ovh-sms.png");
        return new ContractorIcon(iconStream);
    }
}
