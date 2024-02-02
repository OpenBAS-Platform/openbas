package io.openex.injects.channel;

import io.openex.config.OpenExConfig;
import io.openex.contract.Contract;
import io.openex.database.model.*;
import io.openex.database.repository.ArticleRepository;
import io.openex.execution.ExecutableInject;
import io.openex.execution.ExecutionContext;
import io.openex.execution.Injector;
import io.openex.injects.email.service.EmailService;
import io.openex.injects.channel.model.ArticleVariable;
import io.openex.injects.channel.model.ChannelContent;
import io.openex.model.Expectation;
import io.openex.model.expectation.ManualExpectation;
import io.openex.model.expectation.ChannelExpectation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openex.database.model.ExecutionTrace.traceError;
import static io.openex.database.model.ExecutionTrace.traceSuccess;
import static io.openex.helper.StreamHelper.fromIterable;
import static io.openex.injects.channel.ChannelContract.CHANNEL_PUBLISH;

@Component(ChannelContract.TYPE)
public class ChannelExecutor extends Injector {

  public static final String VARIABLE_ARTICLES = "articles";

  public static final String VARIABLE_ARTICLE = "article";

  @Resource
  private OpenExConfig openExConfig;

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

  private String buildArticleUri(ExecutionContext context, Article article) {
    String userId = context.getUser().getId();
    String channelId = article.getChannel().getId();
    String exerciseId = article.getExercise().getId();
    String queryOptions = "article=" + article.getId() + "&user=" + userId;
    return openExConfig.getBaseUrl() + "/channels/" + exerciseId + "/" + channelId + "?" + queryOptions;
  }

  @Override
  public List<Expectation> process(
      @NotNull final Execution execution,
      @NotNull final ExecutableInject injection,
      @NotNull final Contract contract) {
    try {
      ChannelContent content = contentConvert(injection, ChannelContent.class);
      List<Article> articles = fromIterable(articleRepository.findAllById(content.getArticles()));
      if (contract.getId().equals(CHANNEL_PUBLISH)) {
        // Article publishing is only linked to execution date of this inject.
        String articleNames = articles.stream().map(Article::getName).collect(Collectors.joining(","));
        String publishedMessage = "Articles (" + articleNames + ") marked as published";
        execution.addTrace(traceSuccess("article", publishedMessage));
        Exercise exercise = injection.getSource().getExercise();
        // Send the publication message.
        if (content.isEmailing()) {
          String replyTo = exercise.getReplyTo();
          List<ExecutionContext> users = injection.getContextUser();
          List<Document> documents = injection.getInject().getDocuments().stream()
              .filter(InjectDocument::isAttached).map(InjectDocument::getDocument).toList();
          List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
          String message = content.buildMessage(injection, imapEnabled);
          boolean encrypted = content.isEncrypted();
          users.stream().parallel().forEach(userInjectContext -> {
            try {
              // Put the challenges variables in the injection context
              List<ArticleVariable> articleVariables = articles.stream()
                  .map(article -> new ArticleVariable(article.getId(), article.getName(),
                      buildArticleUri(userInjectContext, article)))
                  .toList();
              userInjectContext.put(VARIABLE_ARTICLES, articleVariables);
              // Send the email.
              emailService.sendEmail(execution, userInjectContext, replyTo, content.getInReplyTo(), encrypted,
                  content.getSubject(), message, attachments);
            } catch (Exception e) {
              execution.addTrace(traceError("email", e.getMessage(), e));
            }
          });
        } else {
          execution.addTrace(traceSuccess("article", "Email disabled for this inject"));
        }
        List<Expectation> expectations = new ArrayList<>();
        if (!content.getExpectations().isEmpty()) {
          expectations.addAll(
              content.getExpectations()
                  .stream()
                  .flatMap((entry) -> switch (entry.getType()) {
                    case MANUAL -> Stream.of(
                        (Expectation) new ManualExpectation(entry.getScore(), entry.getName(), entry.getDescription())
                    );
                    case ARTICLE -> articles.stream()
                        .map(article -> (Expectation) new ChannelExpectation(entry.getScore(), article));
                    default -> Stream.of();
                  })
                  .toList()
          );
        }
        return expectations;
      } else {
        throw new UnsupportedOperationException("Unknown contract " + contract.getId());
      }
    } catch (Exception e) {
      execution.addTrace(traceError("channel", e.getMessage(), e));
    }
    return List.of();
  }
}
