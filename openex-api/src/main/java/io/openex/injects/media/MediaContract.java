package io.openex.injects.media;

import io.openex.contract.Contract;
import io.openex.contract.ContractCardinality;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.contract.fields.ContractElement;
import io.openex.contract.fields.ContractSelectExercise;
import io.openex.database.model.Exercise;
import io.openex.database.model.Article;
import io.openex.database.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static io.openex.contract.Contract.executableContract;
import static io.openex.contract.ContractCardinality.Multiple;
import static io.openex.contract.ContractDef.contractBuilder;
import static io.openex.contract.fields.ContractAttachment.attachmentField;
import static io.openex.contract.fields.ContractAudience.audienceField;
import static io.openex.contract.fields.ContractCheckbox.checkboxField;
import static io.openex.contract.fields.ContractText.textField;
import static io.openex.contract.fields.ContractTextArea.richTextareaField;
import static io.openex.helper.SupportedLanguage.en;

@Component
public class MediaContract extends Contractor {

    public static final String MEDIA_PUBLISH = "fb5e49a2-6366-4492-b69a-f9b9f39a533e";

    public static final String TYPE = "openex_media";

    private ExerciseRepository exerciseRepository;

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

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
        return new ContractConfig(TYPE, Map.of(en, "Media"), "#cddc39", "/img/media.png", isExpose());
    }

    @Override
    public List<Contract> contracts() {
        ContractConfig contractConfig = getConfig();
        // Standard contract
        Map<String, Map<String, String>> choices = new HashMap<>();
        Iterable<Exercise> exercises = exerciseRepository.findAll();
        exercises.forEach(exercise -> {
            List<Article> articles = exercise.getArticles();
            Map<String, String> articlesChoices = articles.stream().collect(Collectors.toMap(Article::getId, Article::getName));
            choices.put(exercise.getId(), articlesChoices);
        });
        ContractSelectExercise contractSelect = new ContractSelectExercise("article_id", "Article to publish", ContractCardinality.One);
        contractSelect.setChoices(choices);
        // In this "internal" contract we can't express choices.
        // Choices are contextual to a specific exercise.
        String messageBody = """
                    Article can be read at <a href="${article_uri}">here</a>
                    <br/><br/>
                    Your player interface can be accessed through <a href="${player_uri}">this link</a>
                """;
        List<ContractElement> publishInstance = contractBuilder()
                .mandatory(contractSelect)
                .mandatory(textField("subject", "Subject", "A new article was published for you ${user.name}"))
                .mandatory(richTextareaField("body", "Body", messageBody))
                .optional(checkboxField("encrypted", "Encrypted", false))
                .optional(audienceField("audiences", "Audiences", Multiple))
                .optional(attachmentField("attachments", "Attachments", Multiple))
                .build();
        Contract publishArticle = executableContract(contractConfig,
                MEDIA_PUBLISH, Map.of(en, "Publish article"), publishInstance);
        return List.of(publishArticle);
    }
}
