package io.openex.injects.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import io.openex.contract.Contract;
import io.openex.contract.ContractField;
import io.openex.injects.email.model.EmailForm;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractType.*;

@Component
public class EmailContract implements Contract {

    public static final String NAME = "openex_email";

    public EmailContract(ObjectMapper mapper) {
        mapper.registerSubtypes(new NamedType(EmailForm.class, NAME));
    }

    @Override
    public boolean isExpose() {
        return true;
    }

    @Override
    public String getType() {
        return NAME;
    }

    @Override
    public List<ContractField> getFields() {
        return contractBuilder()
                .mandatory("audiences", Audience, Multiple)
                .mandatory("subject")
                .mandatory("body", Richtextarea)
                .optional("encrypted", Checkbox)
                .optional("attachments", Attachment, Multiple)
                .build();
    }
}
