package io.openbas.injectors.email;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.injectors.email.EmailContract.EMAIL_GLOBAL;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.Injector;
import io.openbas.injectors.email.model.EmailContent;
import io.openbas.injectors.email.service.EmailService;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.ManualExpectation;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component(EmailContract.TYPE)
public class EmailExecutor extends Injector {

  @Resource private OpenBASConfig openBASConfig;

  private EmailService emailService;

  @Value("${openbas.mail.imap.enabled}")
  private boolean imapEnabled;

  @Autowired
  public void setEmailService(EmailService emailService) {
    this.emailService = emailService;
  }

  private void sendMulti(
      Execution execution,
      List<ExecutionContext> users,
      String from,
      List<String> replyTos,
      String inReplyTo,
      String subject,
      String message,
      List<DataAttachment> attachments) {
    try {
      emailService.sendEmail(
          execution, users, from, replyTos, inReplyTo, subject, message, attachments);
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
  }

  private void sendSingle(
      Execution execution,
      List<ExecutionContext> users,
      String from,
      List<String> replyTos,
      String inReplyTo,
      boolean mustBeEncrypted,
      String subject,
      String message,
      List<DataAttachment> attachments) {
    users.forEach(
        user -> {
          try {
            emailService.sendEmail(
                execution,
                user,
                from,
                replyTos,
                inReplyTo,
                mustBeEncrypted,
                subject,
                message,
                attachments);
          } catch (Exception e) {
            execution.addTrace(traceError(e.getMessage()));
          }
        });
  }

  @Override
  public ExecutionProcess process(
      @NotNull final Execution execution, @NotNull final ExecutableInject injection)
      throws Exception {
    Inject inject = injection.getInjection().getInject();
    EmailContent content = contentConvert(injection, EmailContent.class);
    List<Document> documents =
        inject.getDocuments().stream()
            .filter(InjectDocument::isAttached)
            .map(InjectDocument::getDocument)
            .toList();
    List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
    String inReplyTo = content.getInReplyTo();
    String subject = content.getSubject();
    String message = content.buildMessage(injection, this.imapEnabled);
    boolean mustBeEncrypted = content.isEncrypted();
    // Resolve the attachments only once
    List<ExecutionContext> users = injection.getUsers();
    if (users.isEmpty()) {
      throw new UnsupportedOperationException("Email needs at least one user");
    }
    Exercise exercise = injection.getInjection().getExercise();
    String from = exercise != null ? exercise.getFrom() : this.openBASConfig.getDefaultMailer();
    List<String> replyTos =
        exercise != null ? exercise.getReplyTos() : List.of(this.openBASConfig.getDefaultReplyTo());
    //noinspection SwitchStatementWithTooFewBranches
    switch (inject
        .getInjectorContract()
        .map(InjectorContract::getId)
        .orElseThrow(() -> new UnsupportedOperationException("Inject does not have a contract"))) {
      case EMAIL_GLOBAL ->
          sendMulti(execution, users, from, replyTos, inReplyTo, subject, message, attachments);
      default ->
          sendSingle(
              execution,
              users,
              from,
              replyTos,
              inReplyTo,
              mustBeEncrypted,
              subject,
              message,
              attachments);
    }
    List<Expectation> expectations =
        content.getExpectations().stream()
            .flatMap(
                (entry) ->
                    switch (entry.getType()) {
                      case MANUAL -> Stream.of((Expectation) new ManualExpectation(entry));
                      default -> Stream.of();
                    })
            .toList();
    return new ExecutionProcess(false);
  }
}
