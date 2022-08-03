package io.openex.injects.email;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.ContractVariable;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import io.openex.contract.fields.ContractNumber;
import io.openex.contract.fields.ContractSelect;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractCardinality.One;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractVariable.variable;
import static io.openex.contract.VariableType.String;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractAudience.audienceField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractNumber.numberField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;
import static io.openex.helper.SupportedLanguage.en;
import static io.openex.helper.SupportedLanguage.fr;

@Component
public class EmailContract extends Contractor {

    public static final String TYPE = "openex_email";
    public static final String EMAIL_DEFAULT = "138ad8f8-32f8-4a22-8114-aaa12322bd09";
    public static final String EMAIL_GLOBAL = "2790bd39-37d4-4e39-be7e-53f3ca783f86";

    @Override
    public boolean isExpose() {
        return true;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public ContractConfig getConfig() {
        return new ContractConfig(TYPE, Map.of(en, "Email", fr, "Email"), "#cddc39", "/img/email.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        // variables
        ContractVariable documentUriVariable = variable("document_uri",
                "Http user link to upload the document (only for document expectation)", String, One);
        // Contracts
        ContractConfig contractConfig = getConfig();
        HashMap<String, String> choices = new HashMap<>();
        choices.put("none", "-");
        choices.put("document", "Each audience should upload a document");
        choices.put("text", "Each audience should submit a text response");
        ContractSelect expectationSelect = ContractSelect
                .selectFieldWithDefault("expectationType", "Expectation", choices, "none");
        expectationSelect.setExpectation(true);
        ContractNumber expectationScore = numberField("expectationScore", "Expectation score", "0",
                List.of(expectationSelect), List.of("document", "text"));
        expectationScore.setExpectation(true);
        // Standard contract
        List<ContractElement> standardInstance = contractBuilder()
                .mandatory(audienceField("audiences", "Audiences", Multiple))
                .mandatory(textField("subject", "Subject"))
                .mandatory(richTextareaField("body", "Body"))
                // .optional(textField("inReplyTo", "InReplyTo", "HIDDEN")) - Use for direct injection
                .optional(checkboxField("encrypted", "Encrypted", false))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .mandatory(expectationSelect)
                .optional(expectationScore)
                .build();
        Contract standardEmail = executableContract(contractConfig, EMAIL_DEFAULT,
                Map.of(en, "Send individual mails", fr, "Envoyer des mails individuels"), standardInstance);
        standardEmail.addVariable(documentUriVariable);
        // Global contract
        List<ContractElement> globalInstance = contractBuilder()
                .mandatory(audienceField("audiences", "Audiences", Multiple))
                .mandatory(textField("subject", "Subject"))
                .mandatory(richTextareaField("body", "Body"))
                // .mandatory(textField("inReplyTo", "InReplyTo", "HIDDEN"))  - Use for direct injection
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .mandatory(expectationSelect)
                .optional(expectationScore)
                .build();
        Contract globalEmail = executableContract(contractConfig, EMAIL_GLOBAL,
                Map.of(en, "Send multi-recipients mail", fr, "Envoyer un mail multi-destinataires"), globalInstance);
        globalEmail.addVariable(documentUriVariable);
        return List.of(standardEmail, globalEmail);
    }
}
