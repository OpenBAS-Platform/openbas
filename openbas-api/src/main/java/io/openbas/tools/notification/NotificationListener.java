package io.openbas.tools.notification;

import com.fasterxml.jackson.databind.JsonNode;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.audit.BaseEvent;
import io.openbas.database.model.Filters;
import io.openbas.database.model.Notification;
import io.openbas.database.model.User;
import io.openbas.rest.stream.StreamService;
import io.openbas.tools.email.EmailBaseService;
import io.openbas.tools.notification.NotificationListenerActions.MatchAndBuild;
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
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;

import static io.openbas.database.audit.ModelBaseListener.DATA_PERSIST;
import static io.openbas.tools.notification.NotificationUtils.*;

@Log
@Service
@RequiredArgsConstructor
public class NotificationListener {

  private final EmailBaseService emailService;
  private final NotificationService notificationService;
  private final StreamService streamService;
  private final NotificationListenerActions notificationListenerActions;
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
      // Event fit the filter ?
      BaseEvent streamEvent = this.streamService
          .buildStreamEvent(event, user.isAdmin()); // is admin need to come from repository
      Optional<Filters.Filter> filter = notification.getFilter()
          .getFilters()
          .stream()
          .filter(f -> f.getKey().equals(ENTITY_ID_FILTER))
          .findFirst();

      // FIXME: delta on the end of the scenario -> all expectations are not fullfill

      if (filter.isPresent()) {
        String schema = event.getSchema();
        List<MatchAndBuild> matchAndBuilds = this.notificationListenerActions.notificationMatchAndBuild.get(schema);
        if (matchAndBuilds != null && !matchAndBuilds.isEmpty()) {
          List<String> values = filter.get().getValues();
          matchAndBuilds.forEach(matchAndBuild -> {
            boolean match = matchAndBuild.getMatch().apply(streamEvent, values);
            if (match && List.of(notification.getEventTypes()).contains(streamEvent.getType())) {
              JsonNode node = event.getInstanceData();
              List<String> outcomes = List.of(notification.getOutcomes());
              if (outcomes.contains(NOTIFIER_EMAIL)) {
                String body = matchAndBuild.getBuildMessage().apply(node);
                this.sendEmail(user, body);
              }
            }
          });
        }
      }
    });
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
