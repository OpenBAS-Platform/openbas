package io.openex.injects.channel;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractCheckbox;
import io.openex.contract.fields.ContractElement;
import io.openex.contract.fields.ContractExpectations;
import io.openex.database.model.Variable.VariableType;
import io.openex.model.inject.form.Expectation;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractCardinality.One;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractVariable.variable;
import static io.openex.contract.fields.ContractArticle.articleField;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractTeam.teamField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractExpectations.expectationsField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;
import static io.openex.database.model.InjectExpectation.EXPECTATION_TYPE.ARTICLE;
import static io.openex.helper.SupportedLanguage.en;
import static io.openex.helper.SupportedLanguage.fr;
import static io.openex.injects.channel.ChannelExecutor.VARIABLE_ARTICLE;
import static io.openex.injects.channel.ChannelExecutor.VARIABLE_ARTICLES;

@Component
public class ChannelContract extends Contractor {

    public static final String CHANNEL_PUBLISH = "fb5e49a2-6366-4492-b69a-f9b9f39a533e";

    public static final String TYPE = "openex_channel";

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
        return new ContractConfig(TYPE, Map.of(en, "Media pressure", fr, "Pression médiatique"), "#ff9800", "/img/channel.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        // In this "internal" contract we can't express choices.
        // Choices are contextual to a specific exercise.
        String messageBody = """
                    Dear player,<br /><br />
                    New channel pressure entries have been published.<br /><br />
                    <#list articles as article>
                        - <a href="${article.uri}">${article.name}</a><br />
                    </#list>
                    <br/><br/>
                    Kind regards,<br />
                    The animation team
                """;
        ContractCheckbox emailingField = checkboxField("emailing", "Send email", true);
        Expectation expectation = new Expectation();
        expectation.setType(ARTICLE);
        expectation.setName("Expect teams to read the article(s)");
        expectation.setScore(0);
        ContractExpectations expectationsField = expectationsField(
            "expectations", "Expectations", List.of(expectation)
        );
        List<ContractElement> publishInstance = contractBuilder()
                // built in
                .optional(teamField("teams", "Teams", Multiple))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .mandatory(articleField("articles", "Articles", Multiple))
                // Contract specific
                .optional(expectationsField)
                // Emailing zone
                .optional(emailingField)
                .mandatory(textField("subject", "Subject", "New channel pressure entries published for ${user.email}",
                        List.of(emailingField)))
                .mandatory(richTextareaField("body", "Body", messageBody,
                        List.of(emailingField)))
                .optional(checkboxField("encrypted", "Encrypted", false,
                        List.of(emailingField)))
                .build();
        Contract publishArticle = executableContract(contractConfig,
                CHANNEL_PUBLISH, Map.of(en, "Publish channel pressure", fr, "Publier de la pression médiatique"), publishInstance);
        // Adding generated variables
        publishArticle.addVariable(variable(VARIABLE_ARTICLES, "List of articles published by the injection", VariableType.Object, Multiple, List.of(
                variable(VARIABLE_ARTICLE + ".id", "Id of the article in the platform", VariableType.String, One),
                variable(VARIABLE_ARTICLE + ".name", "Name of the article", VariableType.String, One),
                variable(VARIABLE_ARTICLE + ".uri", "Http user link to access the article", VariableType.String, One)
        )));
        return List.of(publishArticle);
    }
}
