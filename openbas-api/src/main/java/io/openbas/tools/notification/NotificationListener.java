package io.openbas.tools.notification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.audit.BaseEvent;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.stream.StreamService;
import io.openbas.tools.email.EmailBaseService;
import jakarta.annotation.Resource;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;

import static io.openbas.database.audit.ModelBaseListener.DATA_PERSIST;
import static io.openbas.tools.notification.NotificationUtils.NOTIFIER_EMAIL;

@Log
@Service
@RequiredArgsConstructor
public class NotificationListener {

  private final EmailBaseService emailService;
  private final NotificationService notificationService;
  private final StreamService streamService;
  private final InjectExpectationRepository injectExpectationRepository;
  @Resource
  private OpenBASConfig openBASConfig;
  public static final String ENTITY_ID_FILTER = "entity_id";

  @TransactionalEventListener
  public void listenDatabaseUpdate(BaseEvent event) {
    if (event.getType().equals(DATA_PERSIST)) {
      return;
    }
    List<Notification> notifications = this.notificationService.notifications();
    // FIXME: improv code to group by something
    notifications.forEach(notification -> {
      final User user = notification.getUser();
//       Event fit the filter ?
      BaseEvent streamEvent = this.streamService
          .buildStreamEvent(event, user.isAdmin()); // is admin need to come from repository
      Optional<Filters.Filter> filter = notification.getFilter()
          .getFilters()
          .stream()
          .filter(f -> f.getKey().equals(ENTITY_ID_FILTER))
          .findFirst();
      if (filter.isPresent()) {
        List<String> values = filter.get().getValues();
        String instanceId = streamEvent.getInstance().getId();
        JsonNode injectNode = matchInjectFromInjectExpectations(event, values);
        if (injectNode != null && List.of(notification.getEventTypes()).contains(streamEvent.getType())) {
          List<String> outcomes = List.of(notification.getOutcomes());
          if (outcomes.contains(NOTIFIER_EMAIL)) {// NOTE: if I update a team expectation, I will have also a player expectation update
            String body = buildMessageForInjectExpectation(injectNode);
            this.sendEmail(user, body);
          }
        }
      }
    });
  }

  private JsonNode matchInjectFromInjectExpectations(BaseEvent event, List<String> values) {
    if (event.getSchema().equals("injectexpectations")) {
      JsonNode injectIdJson = event.getInstanceData().get("inject_expectation_inject");
      if (injectIdJson != null) {
        String injectId = injectIdJson.textValue();
        if (values.contains(injectId)) {
          return event.getInstanceData();
        }
      }
    }
    return null;
  }

  private String buildMessageForInjectExpectation(JsonNode injectNode) {
    String injectId = injectNode.get("inject_expectation_inject").textValue();
    String injectExpectationName = injectNode.get("inject_expectation_name").textValue();
    String injectExpectationStatus = injectNode.get("inject_expectation_status").textValue();
    StringBuilder data = new StringBuilder();
    data.append("<div>")
        .append("<br/><br/><br/><br/>")
        .append(
            "---------------------------------------------------------------------------------<br/>")
        .append("Notification for inject " + injectId + " and expectation " + injectExpectationName + "<br/>")
        .append("Result: " + injectExpectationStatus + "<br/>")
        .append(
            "---------------------------------------------------------------------------------<br/>")
        .append("<div>");
    return data.toString();
  }

  private void sendEmail(
      @NotNull final User user,
      @NotNull final String body) {
    try {
      String from = this.openBASConfig.getDefaultMailer();
      List<String> replyTos = List.of(this.openBASConfig.getDefaultReplyTo());
      String subject = "Notification";
      MimeMessage mimeMessage = this.emailService.buildMimeMessage(
          from, replyTos, null, subject, body, List.of()
      );
      List<InternetAddress> recipients = new ArrayList<>();
      recipients.add(new InternetAddress(user.getEmail()));
      mimeMessage.setRecipients(Message.RecipientType.TO, recipients.toArray(InternetAddress[]::new));
      this.emailService.sendEmailWithRetry(mimeMessage, (Exception e) -> log.log(Level.INFO, "Failed to send mail", e));
    } catch (MessagingException | InterruptedException e) {
      log.log(Level.SEVERE, "Failed to send notification email", e);
    }
  }

}
