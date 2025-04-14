package io.openbas.rest.notification_rule.form;

import io.openbas.database.model.NotificationRule;
import io.openbas.database.model.NotificationRuleResourceType;
import io.openbas.database.model.NotificationRuleTrigger;
import io.openbas.database.model.NotificationRuleType;
import org.springframework.stereotype.Component;

@Component
public class NotificationRuleMapper {
    public NotificationRule toNotificationRule(final CreateNotificationRuleInput input) {
        NotificationRule notificationRule = new NotificationRule();
        notificationRule.setResourceId(input.getResourceId());
        notificationRule.setSubject(input.getSubject());
        try {
            notificationRule.setResourceType(NotificationRuleResourceType.valueOf(input.getResourceType()));
        } catch (IllegalArgumentException e) {
            throw new UnsupportedOperationException("Unsupported resource type: " + input.getResourceType());
        }
        try {
            notificationRule.setTrigger(NotificationRuleTrigger.valueOf(input.getTrigger()));
        } catch (IllegalArgumentException e) {
            throw new UnsupportedOperationException("Unsupported trigger: " + input.getTrigger());
        }
        try {
            notificationRule.setType(NotificationRuleType.valueOf(input.getType()));
        } catch (IllegalArgumentException e) {
            throw new UnsupportedOperationException("Unsupported type: " + input.getType());
        }
        return notificationRule;
    }

    public NotificationRuleOutput toNotificationRuleOutput(final NotificationRule notificationRule) {
        return NotificationRuleOutput.builder()
                .id(notificationRule.getId())
                .resourceType(notificationRule.getResourceType().name())
                .resourceId(notificationRule.getResourceId())
                .trigger(notificationRule.getTrigger().name())
                .subject(notificationRule.getSubject())
                .ownerId(notificationRule.getOwner().getId())
                .build();
    }
}
