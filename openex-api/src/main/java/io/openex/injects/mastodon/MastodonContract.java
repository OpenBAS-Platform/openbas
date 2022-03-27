package io.openex.injects.mastodon;

import io.openex.contract.BaseContract;
import io.openex.contract.ContractInstance;
import io.openex.contract.fields.ContractElement;
import io.openex.injects.mastodon.config.MastodonConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.textareaField;

@Component
public class MastodonContract implements BaseContract {

    public static final String MASTODON_DEFAULT = "aeab9ed6-ae98-4b48-b8cc-2e91ac54f2f9";
    public static final String TYPE = "openex_mastodon";

    private MastodonConfig config;

    @Autowired
    public void setConfig(MastodonConfig config) {
        this.config = config;
    }

    @Override
    public boolean isExpose() {
        return config.getEnable();
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public List<ContractInstance> generateContracts() throws Exception {
        List<ContractElement> instance = contractBuilder()
                .mandatory(textField("token", "Token"))
                .mandatory(textareaField("status", "Status"))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .build();
        return List.of(new ContractInstance(TYPE, isExpose(), MASTODON_DEFAULT, "Mastodon", instance));
    }
}
