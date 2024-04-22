package io.openbas.injects.channel;

import io.openbas.contract.Contract;
import io.openbas.contract.ContractConfig;
import io.openbas.contract.Contractor;
import io.openbas.contract.ContractorIcon;
import io.openbas.contract.fields.ContractCheckbox;
import io.openbas.contract.fields.ContractElement;
import io.openbas.contract.fields.ContractExpectations;
import io.openbas.database.model.Variable.VariableType;
import io.openbas.model.inject.form.Expectation;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static io.openbas.contract.Contract.executableContract;
import static io.openbas.contract.ContractCardinality.Multiple;
import static io.openbas.contract.ContractCardinality.One;
import static io.openbas.contract.ContractDef.contractBuilder;
import static io.openbas.contract.ContractVariable.variable;
import static io.openbas.contract.fields.ContractArticle.articleField;
import static io.openbas.contract.fields.ContractAttachment.attachmentField;
import static io.openbas.contract.fields.ContractTeam.teamField;
import static io.openbas.contract.fields.ContractCheckbox.checkboxField;
import static io.openbas.contract.fields.ContractExpectations.expectationsField;
import static io.openbas.contract.fields.ContractText.textField;
import static io.openbas.contract.fields.ContractTextArea.richTextareaField;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.ARTICLE;
import static io.openbas.helper.SupportedLanguage.en;
import static io.openbas.helper.SupportedLanguage.fr;
import static io.openbas.injects.channel.ChannelExecutor.VARIABLE_ARTICLE;
import static io.openbas.injects.channel.ChannelExecutor.VARIABLE_ARTICLES;

@Component
public class ChannelContract extends Contractor {

    public static final String CHANNEL_PUBLISH = "fb5e49a2-6366-4492-b69a-f9b9f39a533e";

    public static final String TYPE = "openbas_channel";

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
        return new ContractConfig(TYPE, Map.of(en, "Media pressure", fr, "Pression médiatique"), "#ff9800", "#ff9800", "/img/channel.png", isExpose());
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
        publishArticle.setAtomicTesting(false);
        return List.of(publishArticle);
    }

    public ContractorIcon getIcon() {
        InputStream iconStream = getClass().getResourceAsStream("/img/icon-media-pressure.png");
        return new ContractorIcon(iconStream);
    }
}
