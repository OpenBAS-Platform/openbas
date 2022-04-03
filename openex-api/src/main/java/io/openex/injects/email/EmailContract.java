package io.openex.injects.email;

import io.openex.contract.Contract;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractAudience.audienceField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;

@Component
public class EmailContract extends Contractor {

    public static final String EMAIL_DEFAULT = "138ad8f8-32f8-4a22-8114-aaa12322bd09";
    public static final String EMAIL_GLOBAL = "2790bd39-37d4-4e39-be7e-53f3ca783f86";
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
    public List<Contract> contracts() throws Exception {
        // Standard contract
        List<ContractElement> standardInstance = contractBuilder()
                .mandatory(audienceField("audiences", "Audiences", Multiple))
                .mandatory(textField("subject", "Subject"))
                .mandatory(richTextareaField("body", "Body"))
                .optional(checkboxField("encrypted", "Encrypted", false))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .build();
        Contract standardEmail = executableContract(TYPE, isExpose(),
                EMAIL_DEFAULT, "User based email", standardInstance);
        // Global contract
        List<ContractElement> globalInstance = contractBuilder()
                .mandatory(audienceField("audiences", "Audiences", Multiple))
                .mandatory(textField("subject", "Subject"))
                .mandatory(richTextareaField("body", "Body"))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .build();
        Contract globalEmail = executableContract(TYPE, isExpose(),
                EMAIL_GLOBAL, "Multi recipients email", globalInstance);
        return List.of(standardEmail, globalEmail);
    }
}
