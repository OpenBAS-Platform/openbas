package io.openex.injects.media;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractCheckbox;
import io.openex.contract.fields.ContractElement;
import io.openex.contract.fields.ContractNumber;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractCardinality.One;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.ContractVariable.variable;
import io.openex.database.model.Variable.VariableType;
import static io.openex.contract.fields.ContractArticle.articleField;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractAudience.audienceField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractNumber.numberField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;
import static io.openex.helper.SupportedLanguage.en;
import static io.openex.helper.SupportedLanguage.fr;
import static io.openex.injects.media.MediaExecutor.VARIABLE_ARTICLE;
import static io.openex.injects.media.MediaExecutor.VARIABLE_ARTICLES;

@Component
public class MediaContract extends Contractor {

    public static final String MEDIA_PUBLISH = "fb5e49a2-6366-4492-b69a-f9b9f39a533e";

    public static final String TYPE = "openex_media";

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
        return new ContractConfig(TYPE, Map.of(en, "Media pressure", fr, "Pression médiatique"), "#ff9800", "/img/media.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        // In this "internal" contract we can't express choices.
        // Choices are contextual to a specific exercise.
        String messageBody = """
                    Dear player,<br /><br />
                    New media pressure entries have been published.<br /><br />
                    <#list articles as article>
                        - <a href="${article.uri}">${article.name}</a><br />
                    </#list>
                    <br/><br/>
                    Kind regards,<br />
                    The animation team
                """;
        ContractCheckbox emailingField = checkboxField("emailing", "Send email", true);
        ContractCheckbox expectationField = checkboxField("expectation", "Expect audiences to read the article(s)", true);
        expectationField.setExpectation(true);
        ContractNumber expectationScore = numberField("expectationScore", "Expectation score", "0", List.of(expectationField));
        expectationScore.setExpectation(true);
        List<ContractElement> publishInstance = contractBuilder()
                // built in
                .optional(audienceField("audiences", "Audiences", Multiple))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .mandatory(articleField("articles", "Articles", Multiple))
                // Contract specific
                .optional(expectationField)
                .optional(expectationScore)
                // Emailing zone
                .optional(emailingField)
                .mandatory(textField("subject", "Subject", "New media pressure entries published for you ${user.name}",
                        List.of(emailingField)))
                .mandatory(richTextareaField("body", "Body", messageBody,
                        List.of(emailingField)))
                .optional(checkboxField("encrypted", "Encrypted", false,
                        List.of(emailingField)))
                .build();
        Contract publishArticle = executableContract(contractConfig,
                MEDIA_PUBLISH, Map.of(en, "Publish media pressure", fr, "Publier de la pression médiatique"), publishInstance);
        // Adding generated variables
        publishArticle.addVariable(variable(VARIABLE_ARTICLES, "List of articles published by the injection", VariableType.Object, Multiple, List.of(
                variable(VARIABLE_ARTICLE + ".id", "Id of the article in the platform", VariableType.String, One),
                variable(VARIABLE_ARTICLE + ".name", "Name of the article", VariableType.String, One),
                variable(VARIABLE_ARTICLE + ".uri", "Http user link to access the article", VariableType.String, One)
        )));
        return List.of(publishArticle);
    }
}
