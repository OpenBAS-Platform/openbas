package io.openex.injects.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractDef;
import io.openex.injects.email.model.EmailForm;
import org.springframework.stereotype.Component;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractType.*;

@Component
public class EmailContract extends Contract {

    public static final String NAME = "openex_email";

    public EmailContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(EmailForm.class, NAME));
    }

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
                .mandatory("audiences", Audience, Multiple)
                .mandatory("subject")
                .mandatory("body", Richtextarea)
                .optional("encrypted", Checkbox)
                .optional("attachments", Attachment, Multiple);
    }
}
