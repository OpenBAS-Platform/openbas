package io.openex.injects.email;

import io.openex.contract.Contract;
import io.openex.contract.ContractDef;
import org.springframework.stereotype.Component;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractType.*;

@Component
public class EmailContract extends Contract {

    public static final String NAME = "openex_email";

    @Override
    public boolean expose() {
        return true;
    }

    @Override
    public String id() {
        return NAME;
    }

    @Override
    public ContractDef definition() {
        return ContractDef.build()
                .mandatory("subject")
                .mandatory("body", Richtextarea)
                .optional("encrypted", Checkbox)
                .optional("attachments", Attachment, Multiple);
    }
}
