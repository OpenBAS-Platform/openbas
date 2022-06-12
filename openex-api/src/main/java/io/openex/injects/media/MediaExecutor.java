package io.openex.injects.media;

import io.openex.contract.Contract;
import io.openex.database.model.Execution;
import io.openex.database.model.MediaArticle;
import io.openex.database.repository.ArticleRepository;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Injector;
import io.openex.injects.media.model.MediaContent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.database.model.ExecutionTrace.traceSuccess;
import static io.openex.injects.media.MediaContract.MEDIA_PUBLISH;

@Component(MediaContract.TYPE)
public class MediaExecutor extends Injector {

    private ArticleRepository articleRepository;

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Override
    public void process(Execution execution, ExecutableInject injection, Contract contract) {
        try {
            MediaContent content = contentConvert(injection, MediaContent.class);
            if (contract.getId().equals(MEDIA_PUBLISH)) {
                MediaArticle article = articleRepository.findById(content.getArticleId()).orElseThrow();
                article.setPublished(true);
                articleRepository.save(article);
                String message = "Article (" + article.getName() + ") successfully published";
                execution.addTrace(traceSuccess("media", message));
            } else {
                throw new UnsupportedOperationException("Unknown contract " + contract.getId());
            }
        } catch (Exception e) {
            execution.addTrace(traceError("media", e.getMessage(), e));
        }
    }
}
