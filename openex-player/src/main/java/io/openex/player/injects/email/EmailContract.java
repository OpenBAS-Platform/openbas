package io.openex.player.injects.email;

import io.openex.player.contract.ContractDef;
import io.openex.player.injects.email.model.EmailContent;
import io.openex.player.model.ContentBase;
import io.openex.player.model.Contract;
import org.springframework.stereotype.Component;

import static io.openex.player.contract.ContractCardinality.Multiple;
import static io.openex.player.contract.ContractType.*;

@Component
public class EmailContract extends Contract {

    @Override
    public boolean expose() {
        return true;
    }

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
    public Class<? extends ContentBase> dataClass() {
        return EmailContent.class;
    }
}
