package io.openbas.injectors.mastodon;

import io.openbas.injector_contract.Contract;
import io.openbas.injector_contract.ContractConfig;
import io.openbas.injector_contract.Contractor;
import io.openbas.injector_contract.ContractorIcon;
import io.openbas.injector_contract.fields.ContractElement;
import io.openbas.database.model.Endpoint;
import io.openbas.injectors.mastodon.config.MastodonConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static io.openbas.injector_contract.Contract.executableContract;
import static io.openbas.injector_contract.ContractCardinality.Multiple;
import static io.openbas.injector_contract.ContractDef.contractBuilder;
import static io.openbas.injector_contract.fields.ContractAttachment.attachmentField;
import static io.openbas.injector_contract.fields.ContractText.textField;
import static io.openbas.injector_contract.fields.ContractTextArea.textareaField;
import static io.openbas.helper.SupportedLanguage.en;

@Component
public class MastodonContract extends Contractor {

    public static final String TYPE = "openbas_mastodon";

    public static final String MASTODON_DEFAULT = "aeab9ed6-ae98-4b48-b8cc-2e91ac54f2f9";

    private MastodonConfig config;

    @Autowired
    public void setConfig(MastodonConfig config) {
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
        return new ContractConfig(TYPE, Map.of(en, "Mastodon"), "#ad1457", "#ad1457", "/img/mastodon.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        List<ContractElement> instance = contractBuilder()
                .mandatory(textField("token", "Token"))
                .mandatory(textareaField("status", "Status"))
                .optional(attachmentField("attachments", "Attachments", Multiple)).build();
        return List.of(executableContract(contractConfig, MASTODON_DEFAULT, Map.of(en, "Mastodon"), instance, List.of(Endpoint.PLATFORM_TYPE.Service), false));
    }

    @Override
    public ContractorIcon getIcon() {
        InputStream iconStream = getClass().getResourceAsStream("/img/icon-mastodon.png");
        return new ContractorIcon(iconStream);
    }
}
