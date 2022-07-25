package io.openex.injects.media;

import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.ArticleRepository;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Injector;
import io.openex.injects.email.service.EmailService;
import io.openex.injects.media.model.MediaContent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.database.model.ExecutionTrace.traceSuccess;
import static io.openex.injects.media.MediaContract.MEDIA_PUBLISH;

@Component(MediaContract.TYPE)
public class MediaExecutor extends Injector {

    private ArticleRepository articleRepository;

    private EmailService emailService;

    @Value("${openex.mail.imap.enabled}")
    private boolean imapEnabled;

    @Autowired
    public void setArticleRepository(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void process(Execution execution, ExecutableInject injection, Contract contract) {
        try {
            MediaContent content = contentConvert(injection, MediaContent.class);
            Article article = articleRepository.findById(content.getArticleId()).orElseThrow();
            if (contract.getId().equals(MEDIA_PUBLISH)) {
                // Article publishing is only linked to execution date of this inject.
                String publishedMessage = "Article (" + article.getName() + ") marked as published";
                execution.addTrace(traceSuccess("media", publishedMessage));
                // Send the publication message.
                Exercise exercise = injection.getSource().getExercise();
                String replyTo = exercise.getReplyTo();
                List<ExecutionContext> users = injection.getUsers();
                List<Document> documents = injection.getInject().getDocuments().stream()
                        .filter(InjectDocument::isAttached).map(InjectDocument::getDocument).toList();
                List<DataAttachment> attachments = resolveAttachments(execution, documents);
                String message = content.buildMessage(injection.getInject(), imapEnabled);
                boolean encrypted = content.isEncrypted();
                users.stream().parallel().forEach(userInjectContext -> {
                    try {
                        // Put the article in the injection context
                        userInjectContext.putArticle(article);
                        // Send the email.
                        emailService.sendEmail(execution, userInjectContext, replyTo, content.getInReplyTo(), encrypted,
                                content.getSubject(), message, attachments);
                    } catch (Exception e) {
                        execution.addTrace(traceError("email", e.getMessage(), e));
                    }
                });

            } else {
                throw new UnsupportedOperationException("Unknown contract " + contract.getId());
            }
        } catch (Exception e) {
            execution.addTrace(traceError("media", e.getMessage(), e));
        }
    }
}
