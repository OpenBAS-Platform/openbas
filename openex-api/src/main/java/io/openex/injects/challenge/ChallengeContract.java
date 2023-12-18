package io.openex.injects.challenge;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractChallenge.challengeField;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractAudience.audienceField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;
import static io.openex.helper.SupportedLanguage.en;
import static io.openex.helper.SupportedLanguage.fr;

@Component
public class ChallengeContract extends Contractor {

    public static final String CHALLENGE_PUBLISH = "f8e70b27-a69c-4b9f-a2df-e217c36b3981";

    public static final String TYPE = "openex_challenge";

    @Override
    protected boolean isExpose() {
        return true;
    }

    @Override
    protected String getType() {
        return TYPE;
    }

    @Override
    public ContractConfig getConfig() {
        return new ContractConfig(TYPE, Map.of(en, "Challenge", fr, "Challenge"), "#e91e63", "/img/challenge.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        // In this "internal" contract we can't express choices.
        // Choices are contextual to a specific exercise.
        String messageBody = """
                    Dear player,<br /><br />
                    News challenges have been published.<br /><br />
                    <#list challenges as challenge>
                        - <a href="${challenge.uri}">${challenge.name}</a><br />
                    </#list>
                    <br/><br/>
                    Kind regards,<br />
                    The animation team
                """;
        List<ContractElement> publishInstance = contractBuilder()
                .mandatory(challengeField("challenges", "Challenges", Multiple))
                .mandatory(textField("subject", "Subject", "New challenges published for ${user.email}"))
                .mandatory(richTextareaField("body", "Body", messageBody))
                .optional(checkboxField("encrypted", "Encrypted", false))
                .mandatory(audienceField("audiences", "Audiences", Multiple))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .build();
        Contract publishChallenge = executableContract(contractConfig,
                CHALLENGE_PUBLISH, Map.of(en, "Publish challenges", fr, "Publier des challenges"), publishInstance);
        return List.of(publishChallenge);
    }
}
