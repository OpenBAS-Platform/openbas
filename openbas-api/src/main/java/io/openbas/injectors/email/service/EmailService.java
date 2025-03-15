package io.openbas.injectors.email.service;

import io.openbas.database.model.DataAttachment;
import io.openbas.database.model.Execution;
import io.openbas.database.model.ExecutionTraceAction;
import io.openbas.execution.ExecutionContext;
import io.openbas.tools.email.EmailBaseService;
import jakarta.mail.Message;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.bouncycastle.openpgp.PGPPublicKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.database.model.ExecutionTraces.*;
import static io.openbas.helper.TemplateHelper.buildContextualContent;
import static java.util.stream.Collectors.joining;

@Component
@RequiredArgsConstructor
public class EmailService {

  private final EmailPgp emailPgp;

  @Value("${openbas.mail.imap.enabled}")
  private boolean imapEnabled;

  private final ImapService imapService;

  private final EmailBaseService emailService;

  public void sendEmail(
      Execution execution,
      List<ExecutionContext> usersContext,
      String from,
      List<String> replyTos,
      String inReplyTo,
      String subject,
      String message,
      List<DataAttachment> attachments)
      throws Exception {
    MimeMessage mimeMessage = this.emailService.buildMimeMessage(
        from, replyTos, inReplyTo, subject, message, attachments
    );
    List<InternetAddress> recipients = new ArrayList<>();
    for (ExecutionContext userContext : usersContext) {
      recipients.add(new InternetAddress(userContext.getUser().getEmail()));
    }
    mimeMessage.setRecipients(Message.RecipientType.TO, recipients.toArray(InternetAddress[]::new));
    this.sendEmailWithRetry(execution, mimeMessage);
    String emails = usersContext.stream().map(c -> c.getUser().getEmail()).collect(joining(", "));
    List<String> userIds = usersContext.stream().map(c -> c.getUser().getId()).toList();
    execution.addTrace(
        getNewSuccessTrace("Mail sent to " + emails, ExecutionTraceAction.EXECUTION, userIds));
    // Store message in Imap after sending
    storeMessageImap(execution, mimeMessage);
  }

  public void sendEmail(
      Execution execution,
      ExecutionContext userContext,
      String from,
      List<String> replyTos,
      String inReplyTo,
      boolean mustBeEncrypted,
      String subject,
      String message,
      List<DataAttachment> attachments)
      throws Exception {
    String email = userContext.getUser().getEmail();
    String contextualSubject = buildContextualContent(subject, userContext);
    String contextualBody = buildContextualContent(message, userContext);

    MimeMessage mimeMessage = this.emailService
        .buildMimeMessage(from, replyTos, inReplyTo, contextualSubject, contextualBody, attachments);
    mimeMessage.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
    // Crypt if needed
    if (mustBeEncrypted) {
      PGPPublicKey userPgpKey = emailPgp.getUserPgpKey(userContext.getUser());
      MimeMessage encMessage = this.emailService.buildEncryptedMimeMessage(
          userPgpKey, from, replyTos, subject, email, mimeMessage
      );
      this.sendEmailWithRetry(execution, encMessage);
    } else {
      this.sendEmailWithRetry(execution, mimeMessage);
    }
    List<String> userIds = List.of(userContext.getUser().getId());
    execution.addTrace(
        getNewSuccessTrace("Mail sent to " + email, ExecutionTraceAction.EXECUTION, userIds));
    // Store message in Imap after sending
    storeMessageImap(execution, mimeMessage);
  }

  private void storeMessageImap(Execution execution, MimeMessage mimeMessage)
      throws InterruptedException {
    if (!imapEnabled) {
      execution.addTrace(
          getNewSuccessTrace(
              "Mail successfully send (imap disabled)", ExecutionTraceAction.COMPLETE));
      return;
    }
    if (execution.isRuntime() && imapEnabled) {
      for (int i = 0; i < 3; i++) {
        try {
          imapService.storeSentMessage(mimeMessage);
          execution.addTrace(
              getNewSuccessTrace(
                  "Mail successfully stored in IMAP", ExecutionTraceAction.COMPLETE));
          return;
        } catch (Exception e) {
          execution.addTrace(
              getNewInfoTrace(
                  "Fail to store mail in IMAP " + e.getMessage(), ExecutionTraceAction.EXECUTION));
          Thread.sleep(2000);
        }
      }
      execution.addTrace(
          getNewErrorTrace(
              "Fail to store mail in IMAP after 3 attempts", ExecutionTraceAction.COMPLETE));
    }
  }

  private void sendEmailWithRetry(Execution execution, MimeMessage mimeMessage) throws InterruptedException {
    this.emailService.sendEmailWithRetry(mimeMessage, (Exception e) -> execution
        .addTrace(getNewInfoTrace("Failed to send mail" + e.getMessage(), ExecutionTraceAction.EXECUTION)));
  }

}
