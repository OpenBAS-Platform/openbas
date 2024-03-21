package io.openbas.utils.fixtures;

import io.openbas.contract.Contract;
import io.openbas.contract.ContractConfig;
import io.openbas.contract.ContractSearchInput;
import io.openbas.helper.SupportedLanguage;

import java.util.List;
import java.util.Map;

import static io.openbas.contract.ContractCardinality.Multiple;
import static io.openbas.contract.ContractDef.contractBuilder;
import static io.openbas.contract.fields.ContractArticle.articleField;
import static io.openbas.contract.fields.ContractAttachment.attachmentField;
import static io.openbas.contract.fields.ContractCheckbox.checkboxField;
import static io.openbas.contract.fields.ContractTeam.teamField;
import static io.openbas.contract.fields.ContractText.textField;
import static io.openbas.contract.fields.ContractTextArea.richTextareaField;
import static io.openbas.contract.fields.ContractTextArea.textareaField;
import static io.openbas.contract.fields.ContractTuple.tupleField;

public class ContractFixture {

    public static ContractSearchInput getDefault() {
        ContractSearchInput contractSearchInput = new ContractSearchInput();
        contractSearchInput.setExposedContractsOnly(true);
        return contractSearchInput;
    }

    public static Map<String, Contract> getContracts() {
        return Map.of("1108ad8f8-32f8-4a22-8114-aaa12322bd09",
                Contract.manualContract(
                        new ContractConfig("openbas_email",
                                Map.of(SupportedLanguage.en, "Email", SupportedLanguage.fr, "Email"),
                                null,
                                null,
                                null,
                                true),
                        "1108ad8f8-32f8-4a22-8114-aaa12322bd09",
                        Map.of(SupportedLanguage.en, "Send individual mails",
                                SupportedLanguage.fr, "Envoyer des mails individuels"),
                        contractBuilder()
                                .mandatory(teamField("teams", "Teams", Multiple))
                                .mandatory(textField("subject", "Subject"))
                                .mandatory(richTextareaField("body", "Body"))
                                .build()
                ), "1fb5e49a2-6366-4492-b69a-f9b9f39a533e",
                Contract.executableContract(
                        new ContractConfig("openbas_channel",
                                Map.of(SupportedLanguage.en, "Media pressure", SupportedLanguage.fr, "Pression médiatique"),
                                null,
                                null,
                                null,
                                true),
                        "1fb5e49a2-6366-4492-b69a-f9b9f39a533e",
                        Map.of(SupportedLanguage.en, "Publish channel pressure",
                                SupportedLanguage.fr, "Publier de la pression médiatique"),
                        contractBuilder()
                                .mandatory(textField("subject", "Subject email", "New channel pressure entries published for ${user.email}",
                                        List.of(checkboxField("emailing", "Send email", true))))
                                .optional(attachmentField("attachments", "Attachments", Multiple))
                                .mandatory(articleField("articles", "Articles", Multiple))
                                .build()
                ), "12790bd39-37d4-4e39-be7e-53f3ca783f86",
                Contract.manualContract(
                        new ContractConfig("openbas_email",
                                Map.of(SupportedLanguage.en, "Email", SupportedLanguage.fr, "Email"),
                                null,
                                null,
                                null,
                                true),
                        "12790bd39-37d4-4e39-be7e-53f3ca783f86",
                        Map.of(SupportedLanguage.en, "Send multi-recipients mail",
                                SupportedLanguage.fr, "Envoyer un mail multi-destinataires"),
                        contractBuilder()
                                .mandatory(teamField("teams", "Teams", Multiple))
                                .mandatory(textField("subject", "Subject"))
                                .mandatory(richTextareaField("body", "Body"))
                                .build()
                ), "15948c96c-4064-4c0d-b079-51ec33f31b91",
                Contract.executableContract(
                        new ContractConfig("openbas_channel",
                                Map.of(SupportedLanguage.en, "HTTP Request", SupportedLanguage.fr, "Requête HTTP"),
                                null,
                                null,
                                null,
                                true),
                        "15948c96c-4064-4c0d-b079-51ec33f31b91",
                        Map.of(SupportedLanguage.en, "HTTP Request - POST (raw body)",
                                SupportedLanguage.fr, "Requête HTTP - POST (body brut)"),
                        contractBuilder()
                                .mandatory(textField("uri", "URL"))
                                .optional(tupleField("headers", "Headers"))
                                .mandatory(textareaField("body", "Raw request data"))
                                .build()
                ), "1e9e902bc-b03d-4223-89e1-fca093ac79dd",
                Contract.executableContract(
                        new ContractConfig("openbas_channel",
                                Map.of(SupportedLanguage.en, "SMS (OVH)"),
                                null,
                                null,
                                null,
                                true),
                        "1e9e902bc-b03d-4223-89e1-fca093ac79dd",
                        Map.of(SupportedLanguage.en, "Send a SMS",
                                SupportedLanguage.fr, "Envoyer un SMS"),
                        contractBuilder()
                                .mandatory(teamField("teams", "Teams", Multiple))
                                .mandatory(textareaField("message", "Message"))
                                .build()
                )
        );
    }

}
