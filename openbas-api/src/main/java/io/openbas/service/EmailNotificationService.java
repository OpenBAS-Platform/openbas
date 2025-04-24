package io.openbas.service;

import static io.openbas.helper.TemplateHelper.buildContextualContent;

import io.openbas.database.model.NotificationRule;
import io.openbas.execution.ExecutionContext;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

  private final MailingService mailingService;

  public void sendNotification(
      @NotNull final NotificationRule rule, @NotNull final Map<String, String> data) {

    // get the template
    String template = getTemplate(rule);

    // replace the dynamic variable
    ExecutionContext executionContext = new ExecutionContext(rule.getOwner(), null);
    executionContext.putAll(data);

    try {

      String body = buildContextualContent(template, executionContext);

      // send the email
      mailingService.sendEmail(rule.getSubject(), body, List.of(rule.getOwner()));

    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Build the name of the template based on the rule information The template name needs to have
   * the format: notification_template_[resource type]_[trigger]_[language].html
   *
   * @param rule
   * @return template content
   */
  private String getTemplate(@NotNull final NotificationRule rule) {
    String templatePath = "email/notification_template_%s_%s_%s.html";

    String templatePathFormatted =
        String.format(
            templatePath,
            rule.getResourceType().name().toLowerCase(),
            rule.getTrigger().name().toLowerCase(),
            "en");
    // TODO update this method to get the template in the user's language and default to english if
    // not possible

    ClassPathResource resource = new ClassPathResource(templatePathFormatted);

    try {
      return Files.readString(Path.of(resource.getURI()));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
