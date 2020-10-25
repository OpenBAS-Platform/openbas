package io.openex.player.injects.email;

import io.openex.player.contract.ContractDef;
import io.openex.player.model.Contract;
import io.openex.player.model.InjectData;

import static io.openex.player.contract.ContractCardinality.Multiple;
import static io.openex.player.contract.ContractType.*;

@SuppressWarnings("unused")
public class EmailContract extends Contract {

    @Override
    public String id() {
        return "openex_email";
    }

    @Override
    public ContractDef definition() {
        return ContractDef.build()
                .mandatory("subject")
                .mandatory("body", Richtextarea)
                .optional("encrypted", Checkbox)
                .optional("attachments", Attachment, Multiple);
    }

    @Override
    public Class<? extends InjectData> dataClass() {
        return EmailInject.class;
    }
}
