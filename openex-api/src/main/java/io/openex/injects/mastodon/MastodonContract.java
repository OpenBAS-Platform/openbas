package io.openex.injects.mastodon;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractField;
import io.openex.injects.mastodon.config.MastodonConfig;
import io.openex.injects.mastodon.model.MastodonForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractType.Attachment;
import static io.openex.contract.ContractType.Textarea;

@Component
public class MastodonContract implements Contract {

    public static final String NAME = "openex_mastodon";

    private MastodonConfig config;

    public MastodonContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(MastodonForm.class, MastodonContract.NAME));
    }

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
        return NAME;
    }

    @Override
    public List<ContractField> getFields() {
        return contractBuilder()
                .mandatory("token")
                .mandatory("status", Textarea)
                .optional("attachments", Attachment, Multiple)
                .build();
    }
}
