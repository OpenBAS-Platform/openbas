package io.openex.injects.email;

import io.openex.contract.BaseContract;
import io.openex.contract.ContractInstance;
import io.openex.contract.fields.ContractElement;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractAudience.audienceField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;

@Component
public class EmailContract implements BaseContract {

    public static final String EMAIL_DEFAULT = "138ad8f8-32f8-4a22-8114-aaa12322bd09";
    public static final String TYPE = "openex_email";

    @Override
    public boolean isExpose() {
        return true;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public List<ContractInstance> generateContracts() throws Exception {
        List<ContractElement> instance = contractBuilder()
                .mandatory(audienceField("audiences", "Audiences", Multiple))
                .mandatory(textField("subject", "Subject"))
                .mandatory(richTextareaField("body", "Body"))
                .optional(checkboxField("encrypted", "Encrypted", false))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .build();
        return List.of(new ContractInstance(TYPE, isExpose(), EMAIL_DEFAULT, "Send an email", instance));
    }
}
