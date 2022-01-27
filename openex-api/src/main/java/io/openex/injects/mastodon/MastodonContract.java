package io.openex.injects.mastodon;

import io.openex.contract.Contract;
import io.openex.contract.ContractDef;
import io.openex.injects.mastodon.config.MastodonConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractType.*;
import static io.openex.contract.ContractType.Attachment;

@Component
public class MastodonContract extends Contract {

    public static final String NAME = "openex_mastodon";

    private MastodonConfig config;

    @Autowired
    public void setConfig(MastodonConfig config) {
        this.config = config;
    }

    @Override
    public boolean expose() {
        return config.getEnable();
    }

    @Override
    public String id() {
        return NAME;
    }

    @Override
    public ContractDef definition() {
        return ContractDef.build()
                .mandatory("token")
                .mandatory("status", Textarea)
                .optional("attachments", Attachment, Multiple);
    }
}
